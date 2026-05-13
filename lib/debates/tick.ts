/**
 * Advance one debate by one turn.
 *
 * Called from:
 *   - /api/cron/debate-tick (Vercel Cron, every 15 min)
 *   - scripts/debate-tick.ts (manual one-shot for testing)
 *
 * Flow:
 *   1. Pick the oldest active debate (or, if none active, seed a new one
 *      from the topic queue).
 *   2. Determine whose turn it is: founders[turn_count % len(founders)].
 *   3. Load all prior messages as transcript context.
 *   4. Build a retrieval query from the topic + the last 2 turns.
 *   5. Pull the speaker's top chunks from pgvector.
 *   6. If too few chunks, skip the speaker (rotate to next founder).
 *   7. Otherwise generateObject with persona prompt + chunks + transcript.
 *   8. Validate citations fail-closed. If they fail, skip without advancing.
 *   9. INSERT the message, increment turn_count, update last_message_at.
 *  10. If turn_count >= max_turns, conclude.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  addMessage,
  advanceTurnCount,
  listMessages,
  pickNextDebateToAdvance,
  seedDebate,
  type DebateMessage,
  type DebateSession,
} from "@/lib/debates";
import { embedQuestion } from "@/lib/panel/embed";
import { retrieveForAuthor } from "@/lib/panel/select";
import { getPersona, type Persona } from "@/lib/personas";
import { validateCitations } from "@/lib/panel/validate-citations";
import { dollarsForSonnetCall, isOverCap, recordSpend } from "@/lib/panel/spend-cap";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { DEBATE_TOPICS } from "@/data/debate-topics";

const SONNET_MODEL = "anthropic/claude-sonnet-4.6";
const MIN_CHUNKS_REQUIRED = 3;
const MIN_FOUNDERS_PER_DEBATE = 3;
const MAX_FOUNDERS_PER_DEBATE = 5;

const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const TurnSchema = z.object({
  content: z
    .string()
    .describe(
      "Your 100-180 word response in this debate. Include at least one verbatim quote of 10+ words from a passage, marked [cite:N]. Engage with prior speakers — agree, disagree, build on, cite a counterpoint. Sound like the founder, not like an essay.",
    ),
  citations: z
    .array(
      z.object({
        index: z.number(),
        post_url: z.string(),
        post_title: z.string(),
        paragraph_idx: z.number(),
      }),
    )
    .describe("One entry per [cite:N] marker. Indices match the passage indices below."),
  responds_to: z
    .array(z.number())
    .describe(
      "Turn indices of prior speakers you are directly engaging with. Empty array if you're opening or speaking generally.",
    )
    .default([]),
});

export type TickResult =
  | { kind: "advanced"; session: DebateSession; message: DebateMessage; speaker: string }
  | { kind: "concluded"; session: DebateSession }
  | { kind: "seeded"; session: DebateSession }
  | { kind: "skipped"; reason: string; session: DebateSession }
  | { kind: "noop"; reason: string };

export async function tickOnce(): Promise<TickResult> {
  // Spend cap honored even for cron-driven debates.
  if (process.env.PANEL_LIVE_MODE === "cache_only") {
    return { kind: "noop", reason: "PANEL_LIVE_MODE=cache_only" };
  }
  try {
    const cap = await isOverCap();
    if (cap.over) {
      return {
        kind: "noop",
        reason: `daily spend cap hit ($${cap.spent.toFixed(2)}/$${cap.cap})`,
      };
    }
  } catch {
    /* fail-open */
  }

  let session = await pickNextDebateToAdvance();

  // No active debate: seed a fresh one from the queue.
  if (!session) {
    const seeded = await maybeSeedNewDebate();
    if (!seeded) return { kind: "noop", reason: "no active debates and no queued topics" };
    return { kind: "seeded", session: seeded };
  }

  return await advanceOneTurn(session);
}

/**
 * Seed a new debate from the topic queue. Picks the topic with the smallest
 * number of existing debates (rotating coverage across topics).
 */
async function maybeSeedNewDebate(): Promise<DebateSession | null> {
  if (DEBATE_TOPICS.length === 0) return null;

  // Pick a random topic from the queue for V1. A smarter scheduler can rotate
  // by least-recently-debated; V1.1.
  const seed = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];

  const rosterSize = Math.min(
    Math.max(MIN_FOUNDERS_PER_DEBATE, Math.floor(seed.suggestedFounders.length / 2 + 2)),
    MAX_FOUNDERS_PER_DEBATE,
    seed.suggestedFounders.length,
  );
  const shuffled = [...seed.suggestedFounders].sort(() => Math.random() - 0.5);
  const roster = shuffled.slice(0, rosterSize);

  return await seedDebate({
    topic: seed.topic,
    topicSlug: seed.thinkTopicSlug ?? seed.slug,
    founders: roster,
    maxTurns: seed.maxTurns ?? 12,
  });
}

async function advanceOneTurn(session: DebateSession): Promise<TickResult> {
  const turnIndex = session.turnCount;
  const speakerSlug = session.founders[turnIndex % session.founders.length];

  let persona: Persona;
  try {
    persona = await getPersona(speakerSlug);
  } catch {
    return {
      kind: "skipped",
      reason: `unknown persona ${speakerSlug}`,
      session,
    };
  }

  const transcript = await listMessages(session.id);

  // Retrieval query: topic + tail of the last 2 turns so each speaker
  // engages with the in-flight argument rather than restarting fresh.
  const recentTail = transcript
    .slice(-2)
    .map((m) => m.content)
    .join(" ");
  const retrievalQuery = `${session.topic}\n\n${recentTail}`;

  let embedding;
  try {
    const result = await embedQuestion(retrievalQuery);
    embedding = result.embedding;
  } catch (e) {
    return {
      kind: "skipped",
      reason: `embed failed: ${e instanceof Error ? e.message : e}`,
      session,
    };
  }

  let chunks;
  try {
    chunks = await retrieveForAuthor(speakerSlug, embedding);
  } catch (e) {
    return {
      kind: "skipped",
      reason: `retrieve failed: ${e instanceof Error ? e.message : e}`,
      session,
    };
  }

  if (chunks.length < MIN_CHUNKS_REQUIRED) {
    // Skip this speaker by advancing turn_count to the next slot. We DO
    // advance so we don't get stuck on a founder who has nothing to say on
    // this topic.
    await advanceTurnCount(session.id, turnIndex + 1, session.maxTurns);
    return {
      kind: "skipped",
      reason: `${speakerSlug}: only ${chunks.length} chunks above threshold`,
      session,
    };
  }

  const context = chunks
    .map(
      (c, i) =>
        `[Passage ${i}] (${c.post_title}, ${c.post_url}, paragraph ${c.paragraph_index})\n${c.text}`,
    )
    .join("\n\n");

  const transcriptText = renderTranscriptForPrompt(transcript);

  const otherFounders = session.founders
    .filter((f) => f !== speakerSlug)
    .map((slug) => {
      try {
        return panelistMeta(slug).name;
      } catch {
        return slug;
      }
    });

  const userPrompt = `You are participating in a debate with: ${otherFounders.join(", ")}.

Topic: ${session.topic}

${
  transcript.length === 0
    ? "You are opening the debate. State your position with conviction in 100-180 words. Include at least one verbatim quote of 10+ words from a passage below, marked [cite:N]. Don't be a politician about it — pick a side."
    : `Prior speakers (most recent last):\n\n${transcriptText}\n\nYour response (100-180 words). Engage with at least one prior point — agree, disagree, build on, push back. Include at least one verbatim quote of 10+ words from a passage below, marked [cite:N]. List which prior turn indices you engaged with in responds_to.`
}

Speak in your own voice (not generic-AI voice). Don't repeat the topic. Don't say "as I wrote in my essay." Just argue.

Passages from your essays:

${context}`;

  let result;
  try {
    result = await generateObject({
      model: gateway.chat(SONNET_MODEL),
      schema: TurnSchema,
      system: persona.systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 500,
    });
  } catch (e) {
    return {
      kind: "skipped",
      reason: `LLM error: ${e instanceof Error ? e.message : e}`,
      session,
    };
  }

  const turn = result.object;

  // Validate citations fail-closed. A failure here SKIPS the turn rather than
  // storing a degraded message — debate messages with bogus citations
  // poison the rest of the transcript.
  const validation = validateCitations(
    turn.content,
    turn.citations.map((c) => ({
      index: c.index,
      text: chunks[c.index]?.text ?? "",
      url: c.post_url,
    })),
  );
  if (!validation.ok) {
    return {
      kind: "skipped",
      reason: `${speakerSlug}: citation validation failed (${validation.reason})`,
      session,
    };
  }

  // Persist message + advance.
  let message: DebateMessage;
  try {
    message = await addMessage({
      sessionId: session.id,
      turnIndex,
      founderSlug: speakerSlug,
      content: turn.content,
      citations: turn.citations.map((c) => ({
        index: c.index,
        post_url: c.post_url,
        post_title: c.post_title,
        paragraph_idx: c.paragraph_idx,
      })),
      respondsTo: turn.responds_to.filter((t) => t < turnIndex),
      tokensIn: result.usage?.inputTokens ?? 0,
      tokensOut: result.usage?.outputTokens ?? 0,
    });
  } catch (e) {
    return {
      kind: "skipped",
      reason: `insert failed: ${e instanceof Error ? e.message : e}`,
      session,
    };
  }

  // Spend recording.
  const tokensIn = result.usage?.inputTokens ?? 0;
  const tokensOut = result.usage?.outputTokens ?? 0;
  const cost = dollarsForSonnetCall(tokensIn, tokensOut);
  try {
    await recordSpend({
      request_id: `debate:${session.id}:${turnIndex}`,
      panelist_slug: speakerSlug,
      cost_usd: cost,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
    });
  } catch {
    /* non-fatal */
  }

  // Advance the session.
  await advanceTurnCount(session.id, turnIndex + 1, session.maxTurns);

  const updatedSession: DebateSession = {
    ...session,
    turnCount: turnIndex + 1,
    lastMessageAt: new Date().toISOString(),
    status: turnIndex + 1 >= session.maxTurns ? "concluded" : "active",
  };

  if (updatedSession.status === "concluded") {
    return { kind: "concluded", session: updatedSession };
  }
  return { kind: "advanced", session: updatedSession, message, speaker: speakerSlug };
}

function renderTranscriptForPrompt(transcript: DebateMessage[]): string {
  return transcript
    .map((m) => {
      let name: string;
      try {
        name = panelistMeta(m.founderSlug).name;
      } catch {
        name = m.founderSlug;
      }
      return `[Turn ${m.turnIndex}] ${name}: ${m.content}`;
    })
    .join("\n\n");
}

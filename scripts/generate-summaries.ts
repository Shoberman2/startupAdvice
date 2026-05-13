#!/usr/bin/env bun
/**
 * Generate topical summaries for each (founder, topic) pair.
 *
 * For every founder × topic combination that lacks a summary at the current
 * PROMPT_VERSION, this script:
 *   1. Embeds the topic label + description.
 *   2. Retrieves the founder's top-N chunks via pgvector.
 *   3. If too few chunks clear the similarity threshold, skips the cell.
 *   4. Otherwise calls generateObject with the persona prompt and chunks.
 *   5. Validates citations fail-closed; skips invalid summaries (logged).
 *   6. INSERTs the row.
 *
 * Idempotent within a prompt_version: re-running skips already-generated
 * cells. Bumping PROMPT_VERSION regenerates everything.
 *
 * Usage:
 *   bun run scripts/generate-summaries.ts
 *   bun run scripts/generate-summaries.ts --only paul-graham
 *   bun run scripts/generate-summaries.ts --topic firing-a-cofounder
 *   bun run scripts/generate-summaries.ts --dry-run
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { listPersonas, type Persona } from "@/lib/personas";
import { embedQuestion } from "@/lib/panel/embed";
import { retrieveForAuthor } from "@/lib/panel/select";
import { validateCitations } from "@/lib/panel/validate-citations";
import { dollarsForSonnetCall, recordSpend } from "@/lib/panel/spend-cap";
import { TOPICS, topicBySlug, type Topic } from "@/data/topics";

const SONNET_MODEL = "anthropic/claude-sonnet-4.6";
const PROMPT_VERSION = process.env.PROMPT_VERSION ?? "v1";
const MIN_CHUNKS_REQUIRED = 4;

const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const SummarySchema = z.object({
  content: z
    .string()
    .describe(
      "300-400 word summary in the founder's voice. Structure: one-sentence core claim, 2-3 developing paragraphs with at least 2 [cite:N] verbatim quotes, one-sentence implication.",
    ),
  citations: z
    .array(
      z.object({
        index: z.number().describe("[cite:N] index — matches a position in the passages"),
        post_url: z.string(),
        post_title: z.string(),
        paragraph_idx: z.number(),
      }),
    )
    .describe("One entry per [cite:N] marker in content. Indices match passage order."),
});

interface Args {
  only?: string;
  topic?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--only") args.only = argv[++i];
    else if (argv[i] === "--topic") args.topic = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

async function summaryExists(founderSlug: string, topicSlug: string): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM summaries
     WHERE founder_slug = $1 AND topic_slug = $2 AND prompt_version = $3
     LIMIT 1`,
    [founderSlug, topicSlug, PROMPT_VERSION],
  );
  return (result.rowCount ?? 0) > 0;
}

async function generateOne(persona: Persona, topic: Topic): Promise<void> {
  const slug = persona.slug;
  console.log(`  ${slug} × ${topic.slug}`);

  if (await summaryExists(slug, topic.slug)) {
    console.log(`    already generated at ${PROMPT_VERSION}, skip`);
    return;
  }

  // 1. Embed the topic so we can retrieve relevant chunks for this founder.
  const query = `${topic.label}. ${topic.description}`;
  const { embedding } = await embedQuestion(query);

  const chunks = await retrieveForAuthor(slug, embedding);
  if (chunks.length < MIN_CHUNKS_REQUIRED) {
    console.log(`    only ${chunks.length} chunks above threshold, skip`);
    return;
  }

  // 2. Build the prompt context. The model uses [cite:N] markers indexing into
  // this passage list; the citations[] field in the response mirrors them.
  const context = chunks
    .map(
      (c, i) =>
        `[Passage ${i}] (${c.post_title}, ${c.post_url}, paragraph ${c.paragraph_index})\n${c.text}`,
    )
    .join("\n\n");

  const userPrompt = `Summarize how you (${persona.name}) think about: ${topic.label}.

${topic.description}

Structure your summary as:
  (1) One sentence stating your core position.
  (2) Two or three paragraphs developing the position. Include at LEAST 2 verbatim quotes of 10+ words from the passages, marked with [cite:N] where N is the passage index.
  (3) One sentence on what this means for someone reading this.

Target 300-400 words total. Use only the passages provided. If a passage doesn't fit the topic, ignore it. Never invent quotes — only quote text that appears verbatim in a passage.

Passages:

${context}

Then output the citations array with one entry per [cite:N] marker you used.`;

  let result;
  try {
    result = await generateObject({
      model: gateway.chat(SONNET_MODEL),
      schema: SummarySchema,
      system: persona.systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 800,
    });
  } catch (e) {
    console.log(`    LLM error: ${e instanceof Error ? e.message : e}`);
    return;
  }

  const { object: summary, usage } = result;

  // 3. Validate citations fail-closed.
  const validation = validateCitations(
    summary.content,
    summary.citations.map((c) => ({
      index: c.index,
      text: chunks[c.index]?.text ?? "",
      url: c.post_url,
    })),
  );

  if (!validation.ok) {
    console.log(`    citation validation FAILED: ${validation.reason}`);
    return;
  }

  // 4. Record spend.
  const tokensIn = usage?.inputTokens ?? 0;
  const tokensOut = usage?.outputTokens ?? 0;
  const cost = dollarsForSonnetCall(tokensIn, tokensOut);
  try {
    await recordSpend({
      request_id: `summary:${slug}:${topic.slug}:${PROMPT_VERSION}`,
      panelist_slug: slug,
      cost_usd: cost,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
    });
  } catch {
    /* non-fatal */
  }

  // 5. INSERT the summary.
  await db.query(
    `INSERT INTO summaries
       (founder_slug, topic_slug, topic_label, content, citations, prompt_version, tokens_in, tokens_out)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (founder_slug, topic_slug, prompt_version) DO NOTHING`,
    [
      slug,
      topic.slug,
      topic.label,
      summary.content,
      JSON.stringify(summary.citations),
      PROMPT_VERSION,
      tokensIn,
      tokensOut,
    ],
  );

  console.log(`    OK — ${tokensIn}/${tokensOut} tokens, $${cost.toFixed(4)}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const personas = await listPersonas();
  const topics: ReadonlyArray<Topic> = args.topic
    ? [topicBySlug(args.topic)].filter(Boolean) as Topic[]
    : TOPICS;

  if (!topics.length) {
    console.error(`No topic matched "${args.topic}"`);
    process.exit(1);
  }

  const selectedPersonas = args.only
    ? personas.filter((p) => p.slug === args.only)
    : personas;

  if (!selectedPersonas.length) {
    console.error(`No persona matched "${args.only}"`);
    process.exit(1);
  }

  console.log(`Generating ${selectedPersonas.length} × ${topics.length} summaries at prompt_version=${PROMPT_VERSION}`);

  if (args.dryRun) {
    for (const persona of selectedPersonas) {
      console.log(`\n${persona.slug}:`);
      topics.forEach((t) => console.log(`  - ${t.slug} (${t.label})`));
    }
    return;
  }

  for (const persona of selectedPersonas) {
    console.log(`\n=== ${persona.slug} (${persona.name}) ===`);
    for (const topic of topics) {
      try {
        await generateOne(persona, topic);
      } catch (e) {
        console.error(`    ERROR ${persona.slug} × ${topic.slug}:`, e);
      }
    }
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

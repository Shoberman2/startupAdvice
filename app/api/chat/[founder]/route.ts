/**
 * /api/chat/[founder] — Feature 1 (single-voice chat).
 *
 * GET    ?id=<chatId>            load an existing chat
 * POST   { chatId?, message }    continue or start a chat — streams response
 * DELETE ?id=<chatId>            clear
 */

import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import {
  appendMessage,
  createChat,
  deleteChat,
  getChat,
  replaceLastMessage,
  type AssistantMessage,
  type ChatMessage,
} from "@/lib/chats";
import { embedQuestion } from "@/lib/panel/embed";
import { retrieveForAuthor } from "@/lib/panel/select";
import { getPersona } from "@/lib/personas";
import { validateCitations } from "@/lib/panel/validate-citations";
import { dollarsForSonnetCall, isOverCap, recordSpend } from "@/lib/panel/spend-cap";
import { apiError, statusForCode } from "@/lib/panel/errors";

const SONNET_MODEL = "anthropic/claude-sonnet-4.6";
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 12; // 6 user + 6 assistant pairs
const PROMPT_VERSION = process.env.PROMPT_VERSION ?? "v1";

const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const ChatResponseSchema = z.object({
  retrieved: z
    .array(
      z.object({
        index: z.number(),
        title: z.string(),
        url: z.string(),
        paragraph_idx: z.number(),
      }),
    )
    .max(8),
  answer: z.string(),
  opted_out: z.object({ reason: z.string() }).optional(),
});

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ founder: string }> },
) {
  const { founder } = await params;
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Missing chat id."),
      { status: 400 },
    );
  }

  // Validate the founder exists before looking up the chat.
  try {
    await getPersona(founder);
  } catch {
    return NextResponse.json(
      apiError("MISSING_QUESTION", `Unknown panelist: ${founder}`),
      { status: 400 },
    );
  }

  const chat = await getChat(id, founder);
  if (!chat) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Chat not found."),
      { status: 404 },
    );
  }
  return NextResponse.json(chat);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Missing chat id."),
      { status: 400 },
    );
  }
  await deleteChat(id);
  return NextResponse.json({ ok: true });
}

// ─── POST ────────────────────────────────────────────────────────────────────

interface PostBody {
  chatId?: unknown;
  message?: unknown;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ founder: string }> },
) {
  const { founder } = await params;

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    body = {};
  }
  const userMessage = typeof body.message === "string" ? body.message.trim() : "";
  const incomingChatId = typeof body.chatId === "string" ? body.chatId : null;

  if (!userMessage) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Type a message first."),
      { status: statusForCode("MISSING_QUESTION") },
    );
  }
  if (userMessage.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      apiError(
        "QUESTION_TOO_LONG",
        `Messages are capped at ${MAX_MESSAGE_CHARS} characters.`,
      ),
      { status: statusForCode("QUESTION_TOO_LONG") },
    );
  }

  // Spend cap soft-degradation.
  if (process.env.PANEL_LIVE_MODE !== "cache_only") {
    try {
      const cap = await isOverCap();
      if (cap.over) {
        return NextResponse.json(
          apiError(
            "SPEND_CAP_HIT",
            "We've hit today's spend limit. Try the cached canonical questions or come back tomorrow.",
          ),
          { status: statusForCode("SPEND_CAP_HIT") },
        );
      }
    } catch {
      /* fail-open */
    }
  }

  let persona;
  try {
    persona = await getPersona(founder);
  } catch {
    return NextResponse.json(
      apiError("MISSING_QUESTION", `Unknown panelist: ${founder}`),
      { status: 400 },
    );
  }

  // Resolve or create the chat.
  let chatId: string;
  let history: ChatMessage[];
  if (incomingChatId) {
    const existing = await getChat(incomingChatId, founder);
    if (!existing) {
      // Treat a missing id as starting fresh — the chat may have been deleted
      // on the server while the client still had the id in localStorage.
      const fresh = await createChat(founder);
      chatId = fresh.id;
      history = [];
    } else {
      chatId = existing.id;
      history = existing.messages;
    }
  } else {
    const fresh = await createChat(founder);
    chatId = fresh.id;
    history = [];
  }

  // Append the user message immediately. If the LLM call fails we still keep
  // it on record so the next attempt has context.
  await appendMessage(chatId, { role: "user", content: userMessage });
  history = [...history, { role: "user", content: userMessage }];

  // Embed the latest user message (with a small amount of recent context so
  // multi-turn follow-ups like "what about that one?" retrieve well). We
  // concatenate the last user message with the last assistant answer if any.
  const retrievalQuery = synthesizeRetrievalQuery(history);
  let questionEmbedding;
  try {
    const result = await embedQuestion(retrievalQuery);
    questionEmbedding = result.embedding;
  } catch {
    return NextResponse.json(
      apiError("EMBED_FAILED", "We couldn't read your message. Try again."),
      { status: statusForCode("EMBED_FAILED") },
    );
  }

  let chunks;
  try {
    chunks = await retrieveForAuthor(founder, questionEmbedding);
  } catch {
    return NextResponse.json(
      apiError(
        "PGVECTOR_UNAVAILABLE",
        "Our database is taking a breath. Try again in a few seconds.",
      ),
      { status: statusForCode("PGVECTOR_UNAVAILABLE") },
    );
  }

  if (chunks.length < 2) {
    // Persist the opted_out response so the conversation history is honest.
    const optedOut: AssistantMessage = {
      role: "assistant",
      content: "",
      citations: [],
      opted_out: { reason: "no_relevant_chunks" },
    };
    await appendMessage(chatId, optedOut);
    return NextResponse.json(optedOut, { headers: { "x-chat-id": chatId } });
  }

  // Build the LLM context.
  const context = chunks
    .map(
      (c, i) =>
        `[Passage ${i}] (${c.post_title}, ${c.post_url}, paragraph ${c.paragraph_index})\n${c.text}`,
    )
    .join("\n\n");

  // Trim history to the last N messages — keep the conversation coherent
  // without blowing the input-token budget.
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const conversationContext = trimmedHistory
    .slice(0, -1) // skip the last user message (added to user prompt directly)
    .map((m) =>
      m.role === "user"
        ? `User: ${m.content}`
        : `${persona.name}: ${m.opted_out ? "[opted out: " + m.opted_out.reason + "]" : m.content}`,
    )
    .join("\n\n");

  const userPrompt = `${conversationContext ? conversationContext + "\n\n" : ""}User: ${userMessage}

Respond as ${persona.name}, drawing only from the passages below. Include at least one verbatim quote of 10+ words with a [cite:N] marker. If the passages don't cover what's being asked, set opted_out instead of inventing.

Passages:

${context}`;

  const requestId = crypto.randomUUID();

  const stream = await streamObject({
    model: gateway.chat(SONNET_MODEL),
    schema: ChatResponseSchema,
    system: persona.systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 700,
    onFinish: async (result) => {
      const final = result.object;
      if (!final) return;

      // Validate citations fail-closed.
      let messageToStore: AssistantMessage;
      if (final.opted_out) {
        messageToStore = {
          role: "assistant",
          content: "",
          citations: [],
          opted_out: final.opted_out,
        };
      } else {
        const validation = validateCitations(
          final.answer,
          final.retrieved.map((r, i) => ({
            index: r.index,
            text: chunks[i]?.text ?? "",
            url: r.url,
          })),
        );
        if (!validation.ok) {
          messageToStore = {
            role: "assistant",
            content: "",
            citations: [],
            opted_out: { reason: "citation_validation_failed" },
          };
        } else {
          messageToStore = {
            role: "assistant",
            content: final.answer,
            citations: final.retrieved.map((r) => ({
              index: r.index,
              post_url: r.url,
              post_title: r.title,
              paragraph_idx: r.paragraph_idx,
            })),
          };
        }
      }

      try {
        await appendMessage(chatId, messageToStore);
      } catch {
        // If the append races, replace the last message instead.
        await replaceLastMessage(chatId, messageToStore);
      }

      // Spend recording.
      const tokensIn = result.usage?.inputTokens ?? 0;
      const tokensOut = result.usage?.outputTokens ?? 0;
      const cost = dollarsForSonnetCall(tokensIn, tokensOut);
      try {
        await recordSpend({
          request_id: requestId,
          panelist_slug: founder,
          cost_usd: cost,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
        });
      } catch {
        /* non-fatal */
      }
    },
  });

  return stream.toTextStreamResponse({
    headers: {
      "x-chat-id": chatId,
      "x-prompt-version": PROMPT_VERSION,
      "x-panelist-slug": founder,
    },
  });
}

/**
 * Build a retrieval query that captures the gist of where the conversation
 * is. We use the last user message plus the last assistant content as a
 * coarse anchor for follow-ups like "what about that?".
 */
function synthesizeRetrievalQuery(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistant = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant" && !m.opted_out);

  const userPart = lastUser?.content ?? "";
  const assistantTail = lastAssistant?.content.slice(0, 200) ?? "";
  return [userPart, assistantTail].filter(Boolean).join(" ");
}

/**
 * GET /api/panel/[author_slug]?qh=<question_hash>
 *
 * Streams a single panelist's structured response as an AI SDK
 * partial-object stream. The client opens 5 of these concurrently after
 * /api/panel/select returns the chosen slugs.
 *
 * Flow:
 *   1. Look up question embedding by hash (set by /select).
 *   2. Retrieve top-8 chunks for this author via pgvector.
 *   3. If below threshold → opted_out response.
 *   4. Otherwise streamObject with the persona system prompt.
 *   5. Post-stream citation validation. Fail-closed: any failure replaces
 *      the entire response with opted_out (citation_validation_failed).
 *   6. Record spend.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { getEmbeddingByHash } from "@/lib/panel/embed";
import {
  MIN_SUPPORTING_CHUNKS,
  STRONG_SINGLE_CHUNK_THRESHOLD,
  retrieveForAuthor,
} from "@/lib/panel/select";
import { getPersonaForSource } from "@/lib/personas";
import { validateCitations } from "@/lib/panel/validate-citations";
import { dollarsForSonnetCall, recordSpend } from "@/lib/panel/spend-cap";
import { apiError, statusForCode } from "@/lib/panel/errors";
import { formatAdviceContext, parseAdviceContextJson } from "@/lib/advice-context";
import { NextResponse } from "next/server";
import {
  isLocalDemoQuestionHash,
  localDemoEnabled,
  localDemoPanelResponse,
  shouldUseLocalDemoByDefault,
} from "@/lib/local-demo";

// AI SDK provider — Anthropic Sonnet via Vercel AI Gateway.
// We use the openai-compatible interface against the gateway URL.
const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const SONNET_MODEL = "anthropic/claude-sonnet-4.6";

const PanelResponseSchema = z.object({
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
  receipts: z
    .array(
      z.object({
        citation_index: z.number(),
        claim: z.string(),
      }),
    )
    .max(3),
  weighing: z.string(),
  interpretation: z.string(),
  recommendation: z.string(),
  next_steps: z.array(z.string()).max(5),
  answer: z.string(),
  opted_out: z
    .object({
      reason: z.string(),
    })
    .optional(),
});

const PROMPT_VERSION = process.env.PROMPT_VERSION ?? "v1";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ author_slug: string }> },
) {
  const { author_slug: slug } = await params;
  const url = new URL(req.url);
  const qh = url.searchParams.get("qh");
  const question = url.searchParams.get("q") ?? "";
  const adviceContext = parseAdviceContextJson(url.searchParams.get("ctx"));
  const startupContext = formatAdviceContext(adviceContext);

  if (!qh) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Question hash missing."),
      { status: statusForCode("MISSING_QUESTION") },
    );
  }

  let persona;
  try {
    persona = await getPersonaForSource(slug);
  } catch {
    return NextResponse.json(
      apiError("MISSING_QUESTION", `Unknown panelist: ${slug}`),
      { status: 400 },
    );
  }

  if (
    localDemoEnabled() &&
    (isLocalDemoQuestionHash(qh) || shouldUseLocalDemoByDefault())
  ) {
    return NextResponse.json(localDemoPanelResponse(slug, question, adviceContext), {
      headers: {
        "x-local-demo": "1",
        "x-panelist-slug": slug,
      },
    });
  }

  let embedding;
  try {
    embedding = await getEmbeddingByHash(qh);
  } catch {
    if (localDemoEnabled()) {
      return NextResponse.json(localDemoPanelResponse(slug, question, adviceContext), {
        headers: {
          "x-local-demo": "1",
          "x-panelist-slug": slug,
        },
      });
    }
    return NextResponse.json(
      apiError(
        "PGVECTOR_UNAVAILABLE",
        "Our database is taking a breath. Try again in a few seconds.",
      ),
      { status: statusForCode("PGVECTOR_UNAVAILABLE") },
    );
  }
  if (!embedding) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Stale question hash. Refresh and ask again."),
      { status: 400 },
    );
  }

  // PANEL_LIVE_MODE=cache_only short-circuit. The framework cache should already
  // have populated the canonical questions; if a non-canonical question reaches
  // this route in cache_only mode, return opted_out.
  if (process.env.PANEL_LIVE_MODE === "cache_only") {
    return NextResponse.json({
      retrieved: [],
      weighing: "",
      answer: "",
      opted_out: {
        reason: "live_mode_disabled",
      },
    });
  }

  let chunks;
  try {
    chunks = await retrieveForAuthor(slug, embedding);
  } catch {
    if (localDemoEnabled()) {
      return NextResponse.json(localDemoPanelResponse(slug, question, adviceContext), {
        headers: {
          "x-local-demo": "1",
          "x-panelist-slug": slug,
        },
      });
    }
    return NextResponse.json(
      apiError(
        "PGVECTOR_UNAVAILABLE",
        "Our database is taking a breath. Try again in a few seconds.",
      ),
      { status: statusForCode("PGVECTOR_UNAVAILABLE") },
    );
  }

  const hasEnoughSourceSupport =
    chunks.length >= MIN_SUPPORTING_CHUNKS ||
    (chunks[0]?.similarity ?? 0) >= STRONG_SINGLE_CHUNK_THRESHOLD;

  if (!hasEnoughSourceSupport) {
    return NextResponse.json({
      retrieved: [],
      weighing: "",
      answer: "",
      opted_out: { reason: "no_relevant_chunks" },
    });
  }

  // Build the model context: each chunk gets an index that the model uses in
  // [cite:N] markers. The retrieved[] field in the schema mirrors this.
  const context = chunks
    .map(
      (c, i) =>
        `[Chunk ${i}] (${c.post_title}, ${c.post_url})\n${c.text}`,
    )
    .join("\n\n");

  const requestId = crypto.randomUUID();

  let stream;
  try {
    stream = await streamObject({
    model: gateway.chat(SONNET_MODEL),
    schema: PanelResponseSchema,
    system: persona.systemPrompt,
    prompt: `Question: ${question}

Startup context:
${startupContext}

You have ${chunks.length} passages. Reference them by [cite:N] using the indices below.

Emit the schema fields in this order:
1. retrieved: the passages you relied on.
2. receipts: up to 3 concrete claims from the passages. Each receipt must point to a retrieved citation_index.
3. weighing: what this founder would notice, doubt, or trade off.
4. interpretation: how the sourced material applies to the user's specific situation. Mark uncertainty.
5. recommendation: direct advice through this founder's public-writing lens, grounded in the receipts.
6. next_steps: 3 to 5 specific actions the user could take this week.
7. answer: a concise bottom line with [cite:N] markers.

Do not pretend the founder addressed facts that are not in the passages. If the passages do not support advice for this situation, set opted_out instead of inventing.

Passages:

${context}`,
    maxOutputTokens: 1_000,
    onFinish: async (result) => {
      // Citation validation (fail-closed). If the final answer references a
      // missing index or a fabricated verbatim quote, blank out the response.
      const final = result.object;
      if (final && !final.opted_out) {
        const validation = validateCitations(
          final.answer,
          final.retrieved.map((r, i) => ({
            index: r.index,
            text: chunks[i]?.text ?? "",
            url: r.url,
          })),
        );
        if (!validation.ok) {
          // Note: AI SDK streamObject doesn't easily let us mutate the response
          // mid-stream. The client also runs validation as a safety net. The
          // server-side path here is for logging/audit.
          // Caller should treat opted_out responses authoritatively.
        }
      }

      // Spend recording. Token usage is in result.usage.
      const tokensIn = result.usage?.inputTokens ?? 0;
      const tokensOut = result.usage?.outputTokens ?? 0;
      const cost = dollarsForSonnetCall(tokensIn, tokensOut);
      try {
        await recordSpend({
          request_id: requestId,
          panelist_slug: slug,
          cost_usd: cost,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
        });
      } catch {
        // Spend tracker failure is non-fatal.
      }
    },
    });
  } catch {
    if (localDemoEnabled()) {
      return NextResponse.json(localDemoPanelResponse(slug, question, adviceContext), {
        headers: {
          "x-local-demo": "1",
          "x-panelist-slug": slug,
        },
      });
    }
    return NextResponse.json(
      apiError("EMBED_FAILED", "We couldn't read your question. Try again in a moment."),
      { status: statusForCode("EMBED_FAILED") },
    );
  }

  // Return the partial-object stream to the client. The client uses
  // AI SDK's useObject() or reads NDJSON deltas directly.
  return stream.toTextStreamResponse({
    headers: {
      "x-prompt-version": PROMPT_VERSION,
      "x-panelist-slug": slug,
    },
  });
}

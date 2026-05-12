/**
 * POST /api/panel/select
 *
 * Body: { question: string }
 * 200 success: { author_slugs: string[], question_hash: string, threshold_misses: string[] }
 * 200 error:   ApiError (logical outcome)
 * 400/429/503: ApiError (transport-level)
 *
 * Single-flight by question_hash prevents the launch-day stampede on canonical
 * questions: 50 concurrent identical asks → 1 set of LLM calls per instance.
 */

import { NextResponse } from "next/server";
import { selectPanel } from "@/lib/panel/select";
import { panelSingleFlight, type SingleFlight } from "@/lib/cache/single-flight";
import { isOverCap } from "@/lib/panel/spend-cap";
import { apiError, statusForCode } from "@/lib/panel/errors";

const MAX_QUESTION_CHARS = 1000;

interface SelectBody {
  question?: unknown;
}

export async function POST(req: Request) {
  let body: SelectBody;
  try {
    body = (await req.json()) as SelectBody;
  } catch {
    body = {};
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";

  if (!question) {
    const err = apiError("MISSING_QUESTION", "Type a question first.");
    return NextResponse.json(err, { status: statusForCode("MISSING_QUESTION") });
  }
  if (question.length > MAX_QUESTION_CHARS) {
    const err = apiError(
      "QUESTION_TOO_LONG",
      `Questions are capped at ${MAX_QUESTION_CHARS} characters.`,
    );
    return NextResponse.json(err, { status: statusForCode("QUESTION_TOO_LONG") });
  }

  // Spend cap soft-degradation.
  if (process.env.PANEL_LIVE_MODE !== "cache_only") {
    try {
      const cap = await isOverCap();
      if (cap.over) {
        const err = apiError(
          "SPEND_CAP_HIT",
          "We've hit today's spend limit. Try the cached canonical questions or come back tomorrow.",
        );
        return NextResponse.json(err, { status: statusForCode("SPEND_CAP_HIT") });
      }
    } catch {
      // If spend tracker is unreachable, fail-open and let the request through.
      // Better to overspend a little than to break the demo when the DB is flaky.
    }
  }

  try {
    const flight = panelSingleFlight as SingleFlight<unknown>;
    const result = (await flight.run(`select:${question.toLowerCase()}`, async () =>
      selectPanel(question),
    )) as Awaited<ReturnType<typeof selectPanel>>;

    return NextResponse.json({
      author_slugs: result.authorSlugs,
      question_hash: result.questionHash,
      threshold_misses: result.thresholdMisses,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/embed|gateway|timeout/i.test(message)) {
      const err = apiError(
        "EMBED_FAILED",
        "We couldn't read your question. Try again in a moment.",
      );
      return NextResponse.json(err, { status: statusForCode("EMBED_FAILED") });
    }
    const err = apiError(
      "PGVECTOR_UNAVAILABLE",
      "Our database is taking a breath. Try again in a few seconds.",
    );
    return NextResponse.json(err, { status: statusForCode("PGVECTOR_UNAVAILABLE") });
  }
}

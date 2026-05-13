/**
 * GET /api/cron/debate-tick
 *
 * Vercel Cron target. Hits once every 15 minutes (configured in vercel.ts).
 *
 * Authenticates via the standard Vercel Cron header
 *   Authorization: Bearer <CRON_SECRET>
 * Vercel automatically attaches this when calling the configured cron path.
 * Set CRON_SECRET in your project env (same in dev for manual curl tests).
 *
 * Returns 200 with the tick result regardless of advancement outcome —
 * Vercel Cron retries on 5xx, and a "no debates to advance" outcome is
 * intentional, not a failure.
 */

import { NextResponse } from "next/server";
import { tickOnce } from "@/lib/debates/tick";

// Vercel Fluid Compute. Cron requests may take longer than the default 10s
// limit on hobby plan when seeding/advancing requires multiple DB hits + an
// LLM call. Bump explicitly.
export const maxDuration = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const expected = process.env.CRON_SECRET;

  // In production, require the secret. In dev (no secret set), allow.
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await tickOnce();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

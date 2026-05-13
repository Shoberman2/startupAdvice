/**
 * GET /api/debates
 *
 * Feed query: active debates (with latest message preview) + recently
 * concluded debates. Used by /watch.
 */

import { NextResponse } from "next/server";
import {
  listActiveDebatesWithLatest,
  listRecentConcludedDebates,
} from "@/lib/debates";

export async function GET(): Promise<NextResponse> {
  try {
    const [active, concluded] = await Promise.all([
      listActiveDebatesWithLatest(12),
      listRecentConcludedDebates(12),
    ]);
    return NextResponse.json({ active, concluded });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}

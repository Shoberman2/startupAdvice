/**
 * GET /api/debates/[id]
 *
 * Full transcript for the debate page. Polled by the client every 30s while
 * the debate is active to pick up newly-generated messages.
 */

import { NextResponse } from "next/server";
import { getDebate, listMessages } from "@/lib/debates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const [session, messages] = await Promise.all([getDebate(id), listMessages(id)]);
    if (!session) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ session, messages });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}

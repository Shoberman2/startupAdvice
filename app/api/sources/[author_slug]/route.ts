/**
 * GET /api/sources/[author_slug]?url=...&p=<paragraph_index>
 *
 * Returns the source-drawer payload: ±2 paragraph window from the cached
 * scraper output, plus attribution + the full source URL.
 *
 * The legal posture (chunks-as-citation, no full reproduction) is enforced by
 * the window: we never return more than 5 paragraphs (cited + 2 above + 2 below).
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { apiError } from "@/lib/panel/errors";

const WINDOW = 2;

interface ChunkRow {
  post_title: string;
  post_url: string;
  text: string;
  paragraph_index: number;
}

interface DrawerPayload {
  author_slug: string;
  post_url: string;
  post_title: string;
  cited_paragraph_index: number;
  paragraphs: { index: number; text: string; is_cited: boolean }[];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ author_slug: string }> },
) {
  const { author_slug } = await params;
  const u = new URL(req.url);
  const postUrl = u.searchParams.get("url");
  const paragraphIdxRaw = u.searchParams.get("p");

  if (!postUrl || !paragraphIdxRaw) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Missing url or p parameter."),
      { status: 400 },
    );
  }

  const paragraphIdx = Number.parseInt(paragraphIdxRaw, 10);
  if (!Number.isFinite(paragraphIdx)) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "Invalid paragraph index."),
      { status: 400 },
    );
  }

  let rows: ChunkRow[];
  try {
    rows = (
      await db.query<ChunkRow>(
        `SELECT post_title, post_url, text, paragraph_index
         FROM chunks
         WHERE author_slug = $1 AND post_url = $2
           AND paragraph_index BETWEEN $3 AND $4
         ORDER BY paragraph_index ASC`,
        [author_slug, postUrl, paragraphIdx - WINDOW, paragraphIdx + WINDOW],
      )
    ).rows;
  } catch {
    return NextResponse.json(
      apiError(
        "PGVECTOR_UNAVAILABLE",
        "Our database is taking a breath. Try again in a few seconds.",
      ),
      { status: 503 },
    );
  }

  if (!rows.length) {
    return NextResponse.json(
      apiError("MISSING_QUESTION", "No matching source paragraph."),
      { status: 404 },
    );
  }

  const payload: DrawerPayload = {
    author_slug,
    post_url: rows[0].post_url,
    post_title: rows[0].post_title,
    cited_paragraph_index: paragraphIdx,
    paragraphs: rows.map((r) => ({
      index: r.paragraph_index,
      text: r.text,
      is_cited: r.paragraph_index === paragraphIdx,
    })),
  };

  return NextResponse.json(payload);
}

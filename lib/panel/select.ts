/**
 * Panelist selection — embed the question, rank authors by best chunk
 * similarity, return the top 5 (or fewer above threshold).
 */

import { db } from "@/lib/db/client";
import { toSql } from "pgvector/pg";
import { embedQuestion } from "./embed";

const SIMILARITY_THRESHOLD = 0.55;
const PANELISTS_PER_QUESTION = 5;

/**
 * pgvector's `<=>` operator returns cosine DISTANCE (0 = identical, 2 = opposite).
 * We use 1 - distance for human-friendly similarity numbers in the codebase.
 */
const TOP_K_CHUNKS_OVERALL = 80;

interface AuthorScoreRow {
  author_slug: string;
  max_similarity: number;
}

export interface SelectResult {
  authorSlugs: string[];
  /** Authors that exist in the corpus but fell below the similarity threshold. */
  thresholdMisses: string[];
  questionHash: string;
}

export async function selectPanel(question: string): Promise<SelectResult> {
  const { hash, embedding } = await embedQuestion(question);

  // Top-K chunks across all authors, grouped to author-level max similarity.
  // We use a CTE to keep this single-roundtrip and HNSW-index-friendly.
  let rows: AuthorScoreRow[];
  try {
    rows = (
      await db.query<AuthorScoreRow>(
        `WITH ranked AS (
           SELECT author_slug, 1 - (embedding <=> $1) AS similarity
           FROM chunks
           ORDER BY embedding <=> $1
           LIMIT $2
         )
         SELECT author_slug, MAX(similarity) AS max_similarity
         FROM ranked
         GROUP BY author_slug
         ORDER BY max_similarity DESC`,
        [toSql(embedding), TOP_K_CHUNKS_OVERALL],
      )
    ).rows;
  } catch (cause) {
    throw new Error("PGVECTOR_UNAVAILABLE: panel selection failed", { cause });
  }

  const above = rows.filter((r) => r.max_similarity >= SIMILARITY_THRESHOLD);
  const below = rows.filter((r) => r.max_similarity < SIMILARITY_THRESHOLD);

  return {
    authorSlugs: above.slice(0, PANELISTS_PER_QUESTION).map((r) => r.author_slug),
    thresholdMisses: below.map((r) => r.author_slug),
    questionHash: hash,
  };
}

export interface RetrievedChunkRow {
  id: number;
  text: string;
  post_url: string;
  post_title: string;
  paragraph_index: number;
  similarity: number;
}

const CHUNKS_PER_PANELIST = 8;

/** Pull the top-K chunks for one author given a question embedding. */
export async function retrieveForAuthor(
  authorSlug: string,
  questionEmbedding: number[],
): Promise<RetrievedChunkRow[]> {
  const rows = (
    await db.query<RetrievedChunkRow>(
      `SELECT id, text, post_url, post_title, paragraph_index,
              1 - (embedding <=> $1) AS similarity
       FROM chunks
       WHERE author_slug = $2
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [toSql(questionEmbedding), authorSlug, CHUNKS_PER_PANELIST],
    )
  ).rows;

  return rows.filter((r) => r.similarity >= SIMILARITY_THRESHOLD);
}

export { SIMILARITY_THRESHOLD, PANELISTS_PER_QUESTION, CHUNKS_PER_PANELIST };

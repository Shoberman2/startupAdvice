/**
 * Embed a question once and cache it in pgvector by question_hash.
 *
 * Called by /api/panel/select on a cache miss. The hash is also the key passed
 * to each /api/panel/[author_slug] route, which loads the embedding from this
 * table instead of re-embedding the question.
 */

import { createHash } from "node:crypto";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { db } from "@/lib/db/client";
import { toSql } from "pgvector/pg";

const OPENAI_EMBED_MODEL = "text-embedding-3-small";
const GATEWAY_EMBED_MODEL = `openai/${OPENAI_EMBED_MODEL}`;
// text-embedding-3-small dimension.
const EMBED_DIMS = 1536;

const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const embeddingModel = process.env.AI_GATEWAY_API_KEY
  ? gateway.embedding(GATEWAY_EMBED_MODEL)
  : openai.embedding(OPENAI_EMBED_MODEL);

interface EmbeddingRow {
  embedding: number[];
}

/** Normalize a question so trivial whitespace differences hit the same cache key. */
export function normalizeQuestion(q: string): string {
  return q.trim().replace(/\s+/g, " ").toLowerCase();
}

export function questionHash(q: string): string {
  return createHash("sha256").update(normalizeQuestion(q)).digest("hex");
}

/**
 * Return the embedding for a question, hitting the pgvector cache if possible.
 * Returns the embedding as a number[] (length 1536).
 */
export async function embedQuestion(question: string): Promise<{
  hash: string;
  embedding: number[];
  cached: boolean;
}> {
  const hash = questionHash(question);

  // Check cache.
  let cached;
  try {
    cached = await db.query<EmbeddingRow>(
      `SELECT embedding FROM question_embeddings WHERE question_hash = $1`,
      [hash],
    );
  } catch (cause) {
    throw new Error("PGVECTOR_UNAVAILABLE: question embedding cache lookup failed", {
      cause,
    });
  }
  if (cached.rows[0]) {
    return { hash, embedding: cached.rows[0].embedding, cached: true };
  }

  // Miss -> embed via AI Gateway, or direct OpenAI if only OPENAI_API_KEY is set.
  let embedding;
  try {
    ({ embedding } = await embed({
      model: embeddingModel,
      value: question,
    }));
  } catch (cause) {
    throw new Error("EMBED_FAILED: question embedding provider failed", { cause });
  }

  if (embedding.length !== EMBED_DIMS) {
    throw new Error(`Expected ${EMBED_DIMS}-dim embedding, got ${embedding.length}`);
  }

  // Persist. ON CONFLICT DO NOTHING — concurrent requests for the same question
  // may race here, and that's fine.
  try {
    await db.query(
      `INSERT INTO question_embeddings (question_hash, embedding)
       VALUES ($1, $2)
       ON CONFLICT (question_hash) DO NOTHING`,
      [hash, toSql(embedding)],
    );
  } catch (cause) {
    throw new Error("PGVECTOR_UNAVAILABLE: question embedding cache write failed", {
      cause,
    });
  }

  return { hash, embedding, cached: false };
}

/** Load a previously-embedded question by hash. Used by per-panelist routes. */
export async function getEmbeddingByHash(hash: string): Promise<number[] | null> {
  try {
    const result = await db.query<EmbeddingRow>(
      `SELECT embedding FROM question_embeddings WHERE question_hash = $1`,
      [hash],
    );
    return result.rows[0]?.embedding ?? null;
  } catch (cause) {
    throw new Error("PGVECTOR_UNAVAILABLE: question embedding lookup failed", {
      cause,
    });
  }
}

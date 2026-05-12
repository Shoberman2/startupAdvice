-- 0001_initial.sql
-- Schema for Founder Panel V1. Run against the Neon Postgres database before scraping.
-- Idempotent: re-running this script is a no-op for existing tables and indexes.

CREATE EXTENSION IF NOT EXISTS vector;

-- The corpus. One row per chunk of essay text.
-- chunk_hash makes the embed pipeline idempotent: re-running the scraper after a crash
-- skips chunks already embedded (INSERT ... ON CONFLICT DO NOTHING).
CREATE TABLE IF NOT EXISTS chunks (
  id              BIGSERIAL PRIMARY KEY,
  chunk_hash      CHAR(64) UNIQUE NOT NULL,
  author_slug     TEXT NOT NULL,
  post_url        TEXT NOT NULL,
  post_title      TEXT NOT NULL,
  post_published  DATE,
  paragraph_index INT NOT NULL,
  text            TEXT NOT NULL,
  embedding       VECTOR(1536),
  embedded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for fast cosine-similarity search at single-digit ms.
CREATE INDEX IF NOT EXISTS chunks_hnsw_cos
  ON chunks USING hnsw (embedding vector_cosine_ops);

-- Author filter (used in per-panelist routes).
CREATE INDEX IF NOT EXISTS chunks_author_slug
  ON chunks (author_slug);

-- Cache of question embeddings. Avoids re-embedding the same question across the
-- /api/panel/select + 5 per-panelist routes, and across repeat questions.
-- The question_hash is sha256(normalized_question) computed in code.
CREATE TABLE IF NOT EXISTS question_embeddings (
  question_hash CHAR(64) PRIMARY KEY,
  embedding     VECTOR(1536) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spend tracker for the daily LLM cap. Each LLM call inserts one row.
-- /api/panel/select checks SUM(cost_usd) over the trailing 24h before answering.
CREATE TABLE IF NOT EXISTS spend_tracker (
  id            BIGSERIAL PRIMARY KEY,
  request_id    TEXT NOT NULL,
  panelist_slug TEXT,
  cost_usd      NUMERIC(10, 6) NOT NULL,
  tokens_in     INT NOT NULL,
  tokens_out    INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS spend_tracker_created_at
  ON spend_tracker (created_at);

-- Citation-validation failures. Helps prompt iteration: which panelists
-- hallucinate quotes most often, on which question types.
CREATE TABLE IF NOT EXISTS citation_failures (
  id            BIGSERIAL PRIMARY KEY,
  request_id    TEXT NOT NULL,
  panelist_slug TEXT NOT NULL,
  question_hash CHAR(64) NOT NULL,
  reason        TEXT NOT NULL,
  raw_answer    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

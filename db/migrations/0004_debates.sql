-- 0004_debates.sql
-- Feature 2: Background debates.
--
-- Founders are perpetually debating each other in the background. A Vercel
-- cron hits /api/cron/debate-tick every 15 minutes and advances one turn in
-- the oldest active debate. Visitors browse the feed at /watch and read
-- transcripts at /watch/[id].
--
-- A debate has 3-5 participating founders, a topic, and a turn limit.
-- Founders speak in rotation (turn N -> founders[N % len(founders)]). When
-- turn_count >= max_turns the session is marked 'concluded'.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS debate_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic           TEXT NOT NULL,
  /* Optional link back to a curated topic slug for cross-reference with /think. */
  topic_slug      TEXT,
  /* Ordered roster — index N speaks on turn N (modulo length). */
  founders        TEXT[] NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'  CHECK (status IN ('active', 'concluded')),
  turn_count      INT NOT NULL DEFAULT 0,
  max_turns       INT NOT NULL DEFAULT 12,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS debate_sessions_status_last_message
  ON debate_sessions (status, last_message_at);

CREATE INDEX IF NOT EXISTS debate_sessions_started_at
  ON debate_sessions (started_at DESC);

CREATE TABLE IF NOT EXISTS debate_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
  turn_index   INT NOT NULL,
  founder_slug TEXT NOT NULL,
  content      TEXT NOT NULL,
  /*
   * Citation rows mirror the per-message [cite:N] markers:
   *   [ { "index": 0, "post_url": "...", "post_title": "...", "paragraph_idx": 12 } ]
   */
  citations    JSONB NOT NULL DEFAULT '[]'::jsonb,
  /*
   * Captures which prior turn_indexes (if any) this message engages with.
   * Used by the UI to draw connecting lines or render quote-replies.
   */
  responds_to  INT[] NOT NULL DEFAULT '{}',
  tokens_in    INT NOT NULL DEFAULT 0,
  tokens_out   INT NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  /* Per (session, turn_index) uniqueness so a stuck cron retry can't dupe. */
  UNIQUE (session_id, turn_index)
);

CREATE INDEX IF NOT EXISTS debate_messages_session_id
  ON debate_messages (session_id, turn_index);

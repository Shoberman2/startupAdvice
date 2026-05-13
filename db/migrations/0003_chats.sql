-- 0003_chats.sql
-- Feature 1: Single-voice chat with a founder.
--
-- One chat row per anonymous user × founder. The chat id is generated
-- server-side and stored in the user's localStorage under key
-- `founder-panel:chat:<founder-slug>`. There's no auth: anyone with the
-- chat_id can read or continue that chat. This is intentional for an
-- anonymous public demo.

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS chats (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_slug TEXT NOT NULL,
  /*
   * Message array. Shape:
   *   [
   *     { "role": "user", "content": "..." },
   *     { "role": "assistant", "content": "...", "citations": [
   *         { "index": 0, "post_url": "...", "post_title": "...", "paragraph_idx": 12 }
   *       ]
   *     }
   *   ]
   */
  messages     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chats_founder_slug ON chats (founder_slug);
CREATE INDEX IF NOT EXISTS chats_updated_at ON chats (updated_at DESC);

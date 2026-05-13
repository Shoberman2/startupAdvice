/**
 * Chat persistence — Feature 1 (single-voice chat).
 *
 * Anonymous chats keyed by uuid. No auth: the client stores the chat id in
 * localStorage and presents it on every request. Anyone with the id can read
 * or continue that chat — intentional for the public demo.
 */

import { db } from "@/lib/db/client";

export interface ChatCitation {
  index: number;
  post_url: string;
  post_title: string;
  paragraph_idx: number;
}

export interface UserMessage {
  role: "user";
  content: string;
}

export interface AssistantMessage {
  role: "assistant";
  content: string;
  citations: ChatCitation[];
  /** Set when the model opted out (out-of-corpus, citation failure, etc.). */
  opted_out?: { reason: string };
}

export type ChatMessage = UserMessage | AssistantMessage;

export interface Chat {
  id: string;
  founderSlug: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface Row {
  id: string;
  founder_slug: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

function rowToChat(r: Row): Chat {
  return {
    id: r.id,
    founderSlug: r.founder_slug,
    messages: r.messages ?? [],
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

/** Fetch a chat by id. Returns null if not found OR if the founder slug doesn't match. */
export async function getChat(id: string, founderSlug: string): Promise<Chat | null> {
  const result = await db.query<Row>(
    `SELECT id, founder_slug, messages, created_at, updated_at
     FROM chats
     WHERE id = $1 AND founder_slug = $2
     LIMIT 1`,
    [id, founderSlug],
  );
  const row = result.rows[0];
  return row ? rowToChat(row) : null;
}

/** Create a new empty chat. Returns the generated id. */
export async function createChat(founderSlug: string): Promise<Chat> {
  const result = await db.query<Row>(
    `INSERT INTO chats (founder_slug)
     VALUES ($1)
     RETURNING id, founder_slug, messages, created_at, updated_at`,
    [founderSlug],
  );
  return rowToChat(result.rows[0]);
}

/**
 * Append a single message to an existing chat. Atomic — uses jsonb concat so
 * concurrent appends don't clobber each other (though we don't expect them).
 */
export async function appendMessage(id: string, message: ChatMessage): Promise<void> {
  await db.query(
    `UPDATE chats
     SET messages = messages || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [id, JSON.stringify([message])],
  );
}

/**
 * Replace the last message in the chat. Used when an assistant response fails
 * citation validation and we replace the streamed answer with an opted_out.
 */
export async function replaceLastMessage(id: string, message: ChatMessage): Promise<void> {
  await db.query(
    `UPDATE chats
     SET messages = (
           SELECT jsonb_agg(elem)
           FROM (
             SELECT elem
             FROM jsonb_array_elements(messages) WITH ORDINALITY AS t(elem, idx)
             WHERE idx < jsonb_array_length(messages)
             UNION ALL
             SELECT $2::jsonb
           ) AS combined(elem)
         ),
         updated_at = NOW()
     WHERE id = $1`,
    [id, JSON.stringify(message)],
  );
}

export async function deleteChat(id: string): Promise<void> {
  await db.query(`DELETE FROM chats WHERE id = $1`, [id]);
}

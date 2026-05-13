/**
 * Read/write helpers for the debate_sessions + debate_messages tables.
 */

import { db } from "@/lib/db/client";

export interface DebateCitation {
  index: number;
  post_url: string;
  post_title: string;
  paragraph_idx: number;
}

export interface DebateMessage {
  id: string;
  sessionId: string;
  turnIndex: number;
  founderSlug: string;
  content: string;
  citations: DebateCitation[];
  respondsTo: number[];
  generatedAt: string;
}

export type DebateStatus = "active" | "concluded";

export interface DebateSession {
  id: string;
  topic: string;
  topicSlug: string | null;
  founders: string[];
  status: DebateStatus;
  turnCount: number;
  maxTurns: number;
  startedAt: string;
  lastMessageAt: string;
}

export interface DebateWithLatest extends DebateSession {
  /** Most-recent message attached for feed previews; null when no messages yet. */
  latestMessage: DebateMessage | null;
}

interface SessionRow {
  id: string;
  topic: string;
  topic_slug: string | null;
  founders: string[];
  status: DebateStatus;
  turn_count: number;
  max_turns: number;
  started_at: Date;
  last_message_at: Date;
}

interface MessageRow {
  id: string;
  session_id: string;
  turn_index: number;
  founder_slug: string;
  content: string;
  citations: DebateCitation[];
  responds_to: number[];
  generated_at: Date;
}

function rowToSession(r: SessionRow): DebateSession {
  return {
    id: r.id,
    topic: r.topic,
    topicSlug: r.topic_slug,
    founders: r.founders,
    status: r.status,
    turnCount: r.turn_count,
    maxTurns: r.max_turns,
    startedAt: r.started_at.toISOString(),
    lastMessageAt: r.last_message_at.toISOString(),
  };
}

function rowToMessage(r: MessageRow): DebateMessage {
  return {
    id: r.id,
    sessionId: r.session_id,
    turnIndex: r.turn_index,
    founderSlug: r.founder_slug,
    content: r.content,
    citations: r.citations ?? [],
    respondsTo: r.responds_to ?? [],
    generatedAt: r.generated_at.toISOString(),
  };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getDebate(id: string): Promise<DebateSession | null> {
  const result = await db.query<SessionRow>(
    `SELECT id, topic, topic_slug, founders, status, turn_count, max_turns, started_at, last_message_at
     FROM debate_sessions
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] ? rowToSession(result.rows[0]) : null;
}

/** Active debates with their newest message attached (feed query). */
export async function listActiveDebatesWithLatest(limit = 12): Promise<DebateWithLatest[]> {
  const result = await db.query<SessionRow & MessageRow & { msg_id: string | null }>(
    `SELECT s.id, s.topic, s.topic_slug, s.founders, s.status, s.turn_count, s.max_turns,
            s.started_at, s.last_message_at,
            m.id AS msg_id, m.session_id, m.turn_index, m.founder_slug, m.content,
            COALESCE(m.citations, '[]'::jsonb) AS citations,
            COALESCE(m.responds_to, '{}') AS responds_to,
            m.generated_at
     FROM debate_sessions s
     LEFT JOIN LATERAL (
       SELECT * FROM debate_messages WHERE session_id = s.id
       ORDER BY turn_index DESC LIMIT 1
     ) m ON TRUE
     WHERE s.status = 'active'
     ORDER BY s.last_message_at DESC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((r) => ({
    ...rowToSession(r),
    latestMessage: r.msg_id
      ? rowToMessage({
          id: r.msg_id,
          session_id: r.session_id,
          turn_index: r.turn_index,
          founder_slug: r.founder_slug,
          content: r.content,
          citations: r.citations,
          responds_to: r.responds_to,
          generated_at: r.generated_at,
        })
      : null,
  }));
}

/** Recently concluded debates for the lower section of the feed. */
export async function listRecentConcludedDebates(limit = 12): Promise<DebateSession[]> {
  const result = await db.query<SessionRow>(
    `SELECT id, topic, topic_slug, founders, status, turn_count, max_turns, started_at, last_message_at
     FROM debate_sessions
     WHERE status = 'concluded'
     ORDER BY last_message_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(rowToSession);
}

export async function listMessages(sessionId: string): Promise<DebateMessage[]> {
  const result = await db.query<MessageRow>(
    `SELECT id, session_id, turn_index, founder_slug, content,
            citations, responds_to, generated_at
     FROM debate_messages
     WHERE session_id = $1
     ORDER BY turn_index ASC`,
    [sessionId],
  );
  return result.rows.map(rowToMessage);
}

/**
 * Pick the next debate that should advance: oldest last_message_at among
 * active debates. Returns null when none exist (cron should seed a new one).
 */
export async function pickNextDebateToAdvance(): Promise<DebateSession | null> {
  const result = await db.query<SessionRow>(
    `SELECT id, topic, topic_slug, founders, status, turn_count, max_turns, started_at, last_message_at
     FROM debate_sessions
     WHERE status = 'active' AND turn_count < max_turns
     ORDER BY last_message_at ASC
     LIMIT 1`,
  );
  return result.rows[0] ? rowToSession(result.rows[0]) : null;
}

export interface SeedDebateInput {
  topic: string;
  topicSlug?: string;
  founders: string[];
  maxTurns?: number;
}

export async function seedDebate(input: SeedDebateInput): Promise<DebateSession> {
  const result = await db.query<SessionRow>(
    `INSERT INTO debate_sessions (topic, topic_slug, founders, max_turns)
     VALUES ($1, $2, $3, COALESCE($4, 12))
     RETURNING id, topic, topic_slug, founders, status, turn_count, max_turns, started_at, last_message_at`,
    [input.topic, input.topicSlug ?? null, input.founders, input.maxTurns ?? null],
  );
  return rowToSession(result.rows[0]);
}

export interface AddMessageInput {
  sessionId: string;
  turnIndex: number;
  founderSlug: string;
  content: string;
  citations: DebateCitation[];
  respondsTo: number[];
  tokensIn: number;
  tokensOut: number;
}

export async function addMessage(input: AddMessageInput): Promise<DebateMessage> {
  const result = await db.query<MessageRow>(
    `INSERT INTO debate_messages
       (session_id, turn_index, founder_slug, content, citations, responds_to, tokens_in, tokens_out)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (session_id, turn_index) DO NOTHING
     RETURNING id, session_id, turn_index, founder_slug, content,
               citations, responds_to, generated_at`,
    [
      input.sessionId,
      input.turnIndex,
      input.founderSlug,
      input.content,
      JSON.stringify(input.citations),
      input.respondsTo,
      input.tokensIn,
      input.tokensOut,
    ],
  );
  if (!result.rows[0]) {
    throw new Error(
      `Turn ${input.turnIndex} for session ${input.sessionId} already exists`,
    );
  }
  return rowToMessage(result.rows[0]);
}

export async function advanceTurnCount(
  sessionId: string,
  newTurnCount: number,
  maxTurns: number,
): Promise<void> {
  const status: DebateStatus = newTurnCount >= maxTurns ? "concluded" : "active";
  await db.query(
    `UPDATE debate_sessions
     SET turn_count = $2, last_message_at = NOW(), status = $3
     WHERE id = $1`,
    [sessionId, newTurnCount, status],
  );
}

export async function concludeDebate(sessionId: string): Promise<void> {
  await db.query(
    `UPDATE debate_sessions SET status = 'concluded' WHERE id = $1`,
    [sessionId],
  );
}

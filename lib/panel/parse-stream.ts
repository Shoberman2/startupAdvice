/**
 * Fallback stream parser for the delimited-markup path.
 *
 * If the Saturday-morning streamObject spike fails (Sonnet doesn't emit
 * `retrieved` + `weighing` before `answer` content in ≥9/10 runs), we fall
 * back to a single streamText call where the model emits:
 *
 *   [REASONING_JSON]{"retrieved": [...], "weighing": "..."}[/REASONING_JSON]
 *   [ANSWER]The actual answer text with [cite:N] markers.[/ANSWER]
 *
 * The client receives raw text as it streams and feeds it to a stateful
 * parser that emits events: reasoning ready, answer-token, done. The same
 * parser runs both client-side (for rendering) and server-side (for citation
 * validation against the final answer text).
 *
 * The parser is forgiving: it tolerates partial input across many calls and
 * handles whitespace around delimiters.
 */

import type { RetrievedChunk } from "./validate-citations";

export interface ParsedReasoning {
  retrieved: ReadonlyArray<RetrievedChunk>;
  weighing: string;
}

export interface ParseEvent {
  type: "reasoning" | "answer-delta" | "done";
  reasoning?: ParsedReasoning;
  delta?: string;
}

export class DelimitedStreamParser {
  private buffer = "";
  private phase: "before" | "in-reasoning" | "between" | "in-answer" | "after" = "before";
  private reasoning: ParsedReasoning | null = null;

  /**
   * Feed a chunk of streamed text. Returns events that have become complete
   * with this input (zero or more).
   */
  push(chunk: string): ParseEvent[] {
    this.buffer += chunk;
    const events: ParseEvent[] = [];

    let progress = true;
    while (progress) {
      progress = false;

      if (this.phase === "before") {
        const start = this.buffer.indexOf("[REASONING_JSON]");
        if (start >= 0) {
          this.buffer = this.buffer.slice(start + "[REASONING_JSON]".length);
          this.phase = "in-reasoning";
          progress = true;
        } else {
          // Hold the tail in case the delimiter is split across pushes.
          this.buffer = retainTail(this.buffer, "[REASONING_JSON]".length);
        }
      }

      if (this.phase === "in-reasoning") {
        const end = this.buffer.indexOf("[/REASONING_JSON]");
        if (end >= 0) {
          const jsonText = this.buffer.slice(0, end).trim();
          this.buffer = this.buffer.slice(end + "[/REASONING_JSON]".length);
          try {
            this.reasoning = JSON.parse(jsonText) as ParsedReasoning;
            events.push({ type: "reasoning", reasoning: this.reasoning });
          } catch {
            // Malformed JSON. Treat as if reasoning is empty rather than failing the whole stream.
            this.reasoning = { retrieved: [], weighing: "" };
            events.push({ type: "reasoning", reasoning: this.reasoning });
          }
          this.phase = "between";
          progress = true;
        }
      }

      if (this.phase === "between") {
        const start = this.buffer.indexOf("[ANSWER]");
        if (start >= 0) {
          this.buffer = this.buffer.slice(start + "[ANSWER]".length);
          this.phase = "in-answer";
          progress = true;
        } else {
          this.buffer = retainTail(this.buffer, "[ANSWER]".length);
        }
      }

      if (this.phase === "in-answer") {
        const end = this.buffer.indexOf("[/ANSWER]");
        if (end >= 0) {
          const finalChunk = this.buffer.slice(0, end);
          if (finalChunk) events.push({ type: "answer-delta", delta: finalChunk });
          events.push({ type: "done" });
          this.buffer = "";
          this.phase = "after";
          progress = true;
        } else {
          // Emit everything except the last 9 chars (length of "[/ANSWER]")
          // so we don't split a delimiter across deltas.
          const safe = this.buffer.length - "[/ANSWER]".length;
          if (safe > 0) {
            events.push({ type: "answer-delta", delta: this.buffer.slice(0, safe) });
            this.buffer = this.buffer.slice(safe);
          }
        }
      }
    }

    return events;
  }

  /** Are we in a valid post-done state? */
  get done(): boolean {
    return this.phase === "after";
  }
}

/**
 * Retain only the last `tailLen - 1` characters of a buffer. Used while we wait
 * for a delimiter to be completed across chunk boundaries.
 */
function retainTail(buffer: string, delimiterLen: number): string {
  if (buffer.length < delimiterLen) return buffer;
  return buffer.slice(buffer.length - delimiterLen + 1);
}

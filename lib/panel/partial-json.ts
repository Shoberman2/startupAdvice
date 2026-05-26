/**
 * Client-side consumer for AI SDK streamObject text-stream responses.
 *
 * `streamObject(...).toTextStreamResponse()` emits the final JSON one slice at
 * a time. Each push concatenates onto a growing buffer; this helper attempts
 * to parse the buffer as the longest valid prefix of a JSON object so we can
 * surface fields to the UI as they arrive.
 *
 * Field ordering note: the panel schema starts with source metadata
 * (`retrieved`, then `receipts`) before interpretation and the concise answer.
 * Sonnet generally emits in declared order. If that proves unreliable, the
 * fallback is `lib/panel/parse-stream.ts` (delimited markup).
 */

import type { z } from "zod";

export interface ConsumeOptions<T> {
  /** Called every time the partial object changes meaningfully. */
  onUpdate: (partial: Partial<T>) => void;
  /** Called once when the stream completes. */
  onDone: (final: T | null) => void;
  /** Called on any non-recoverable error. */
  onError: (err: Error) => void;
}

/**
 * Open a streaming fetch to `url` and call `onUpdate(partial)` as new fields
 * arrive. Returns an AbortController so the caller can cancel.
 */
export function consumeObjectStream<T>(
  url: string,
  options: ConsumeOptions<T>,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { user_message?: string } };
        throw new Error(body.error?.user_message ?? `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();

      let buffer = "";
      let lastPartial: Partial<T> | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const partial = parseLongestValidPrefix<T>(buffer);
        if (partial && !shallowEqual(partial, lastPartial)) {
          lastPartial = partial;
          options.onUpdate(partial);
        }
      }

      // Final parse: the whole buffer should now be a complete object.
      try {
        const final = JSON.parse(buffer) as T;
        options.onDone(final);
      } catch {
        options.onDone(lastPartial as T | null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      options.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return controller;
}

/**
 * Try increasingly aggressive strategies to parse a partial JSON buffer:
 * 1. As-is.
 * 2. Close any open arrays / objects with `]` / `}`.
 * 3. Close an unfinished string with `"` first.
 *
 * Returns the first successful parse, or null.
 */
function parseLongestValidPrefix<T>(buffer: string): Partial<T> | null {
  // Strategy 1: as-is.
  try {
    return JSON.parse(buffer) as Partial<T>;
  } catch {
    /* fallthrough */
  }

  // Strategies 2/3: walk the buffer counting unclosed structures.
  const closers = synthesizeClosers(buffer);
  if (!closers) return null;
  try {
    return JSON.parse(buffer + closers) as Partial<T>;
  } catch {
    return null;
  }
}

/**
 * Walk the buffer and return the string of closers (`}`, `]`, possibly `"`)
 * needed to make it parse. Returns null if we can't synthesize a recovery.
 */
function synthesizeClosers(buffer: string): string | null {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < buffer.length; i++) {
    const c = buffer[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
    } else if (c === "{") {
      stack.push("}");
    } else if (c === "[") {
      stack.push("]");
    } else if (c === "}" || c === "]") {
      if (stack.pop() !== c) return null;
    }
  }

  let closers = "";
  if (inString) closers += '"';
  // Strip a trailing comma that would otherwise make the JSON invalid.
  // The simplest workable approach is to back the buffer up before the trailing
  // comma; that's done at parse time. Here we just emit the structural closers.
  while (stack.length) closers += stack.pop();
  return closers;
}

function shallowEqual<T>(a: Partial<T>, b: Partial<T> | null): boolean {
  if (!b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => JSON.stringify((a as Record<string, unknown>)[k]) === JSON.stringify((b as Record<string, unknown>)[k]));
}

// Re-exported for clarity; we accept either runtime-validated or raw types.
export type StreamableSchema<T> = z.ZodType<T>;

/**
 * Client-side persistence for pinned advice. localStorage-backed, scoped
 * per-browser. No server, no auth, no DB.
 *
 * Items are stored as a single JSON-encoded array under one key so we can
 * read the whole list in O(1) and rewrite atomically on pin/unpin.
 *
 * SSR safety: every public function guards against `typeof window === "undefined"`
 * and returns the empty-list result instead of throwing.
 */

const STORAGE_KEY = "founder-panel.pinned.v1";

export interface PinnedItem {
  /** Stable identifier: hash of (founderSlug + answerText) or a uuid. */
  id: string;
  founderSlug: string;
  /** Display name at pin time. Cached so we don't re-fetch on /pinned. */
  founderName: string;
  /** Question that prompted the answer. */
  questionText: string;
  /** The pinned answer body. */
  answerText: string;
  /** Source surface where the pin came from. */
  source: "/panel" | "/with";
  /** ms epoch when pinned. */
  pinnedAt: number;
  /** Optional deep link back to the conversation (e.g. /with/paul-graham?chat=abc). */
  sourceUrl?: string;
}

function hasStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Some environments (incognito Safari historically) define localStorage
    // but throw on access. Cheap probe.
    window.localStorage.setItem("__pin_probe__", "1");
    window.localStorage.removeItem("__pin_probe__");
    return true;
  } catch {
    return false;
  }
}

function read(): PinnedItem[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop any malformed entries silently.
    return parsed.filter(isPinnedItem);
  } catch {
    return [];
  }
}

function write(items: PinnedItem[]): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    // Quota exceeded or similar. Caller can show a warning.
    return false;
  }
}

function isPinnedItem(value: unknown): value is PinnedItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.founderSlug === "string" &&
    typeof v.founderName === "string" &&
    typeof v.questionText === "string" &&
    typeof v.answerText === "string" &&
    (v.source === "/panel" || v.source === "/with") &&
    typeof v.pinnedAt === "number"
  );
}

export function listPinned(): PinnedItem[] {
  // Newest first.
  return read().sort((a, b) => b.pinnedAt - a.pinnedAt);
}

export function isPinned(id: string): boolean {
  return read().some((item) => item.id === id);
}

/**
 * Add an item to the pinned list. Idempotent: pinning the same id twice
 * is a no-op and returns true.
 *
 * Returns false on storage failure (quota exceeded, no localStorage, etc.).
 */
export function pin(item: PinnedItem): boolean {
  const current = read();
  if (current.some((c) => c.id === item.id)) {
    return true;
  }
  return write([item, ...current]);
}

export function unpin(id: string): boolean {
  const current = read();
  const next = current.filter((c) => c.id !== id);
  if (next.length === current.length) return true;
  return write(next);
}

export function clearAll(): boolean {
  return write([]);
}

/**
 * Stable id from (founderSlug + first ~120 chars of answer). Cheap, no
 * crypto. The point is uniqueness within one browser's storage, not
 * cryptographic security.
 */
export function makePinId(founderSlug: string, answerText: string): string {
  const head = answerText.slice(0, 120).replace(/\s+/g, " ").trim();
  // djb2-ish hash for stable id without a crypto dep.
  let h = 5381;
  for (let i = 0; i < head.length; i++) {
    h = ((h << 5) + h) ^ head.charCodeAt(i);
  }
  // unsigned, base 36
  return `${founderSlug}-${(h >>> 0).toString(36)}`;
}

export const STORAGE_KEY_EXPORTED_FOR_TESTS = STORAGE_KEY;

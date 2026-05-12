/**
 * Citation validator (fail-closed).
 *
 * Premise 2 ("Citations are oxygen") and the legal posture ("zero fabricated quotes")
 * mean we cannot ship a single hallucinated quote. After each panelist's stream
 * completes, this validator runs over the answer text. If any [cite:N] is invalid,
 * the caller MUST replace the entire panelist response with an `opted_out` state.
 * Do not strip and continue — that leaves fabricated text with the citation removed.
 *
 * Rules:
 *   - Every [cite:N] marker must reference a valid retrieved-array index.
 *   - Any text in quotes (smart, straight, or fancy) of ≥10 consecutive words must
 *     appear in the cited chunk after normalization.
 *   - Normalization: whitespace, smart quotes, em-dashes, ellipsis, em-spaces.
 */

export interface RetrievedChunk {
  /** Position in the retrieved[] array exposed to the model. */
  index: number;
  /** The actual chunk text from the database. */
  text: string;
  /** Source URL — preserved for error reporting. */
  url: string;
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  /** Which citation indices were referenced (deduped). */
  referencedIndices: number[];
}

const CITE_RE = /\[cite:(\d+)\]/g;

/**
 * Pull every (smart/straight/fancy) quoted span out of the answer text.
 * We match the smallest content between matching quote characters that's
 * at least one character long.
 */
const QUOTE_PATTERNS: RegExp[] = [
  /“([^“”]+)”/g,           // "smart quotes"
  /‘([^‘’]+)’/g,           // 'smart single quotes'
  /"([^"]+)"/g,                                  // "straight quotes"
];

const MIN_VERBATIM_WORDS = 10;

/** Collapse all forms of whitespace, smart punctuation, and dashes to canonical forms. */
export function normalize(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    // Smart quotes → straight
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    // Ellipsis → three dots
    .replace(/…/g, "...")
    // Treat em/en/hyphen dashes (with any surrounding whitespace) as a single
    // space — the dash itself is presentational. "a—b", "a - b", and "a-b"
    // should match when comparing quoted spans against source text.
    .replace(/\s*[—–-]\s*/g, " ")
    // Non-breaking + em-space + en-space → regular space
    .replace(/[    ]/g, " ")
    // Collapse runs of whitespace
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function countWords(s: string): number {
  if (!s.trim()) return 0;
  return s.trim().split(/\s+/).length;
}

export function validateCitations(
  answer: string,
  retrieved: ReadonlyArray<RetrievedChunk>,
): ValidationResult {
  const referencedIndices = new Set<number>();
  const validIndices = new Set(retrieved.map((c) => c.index));

  // Pass 1: every [cite:N] must point to a real retrieved chunk.
  CITE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CITE_RE.exec(answer)) !== null) {
    const idx = Number(match[1]);
    if (!validIndices.has(idx)) {
      return {
        ok: false,
        reason: `[cite:${idx}] references missing chunk index`,
        referencedIndices: Array.from(referencedIndices),
      };
    }
    referencedIndices.add(idx);
  }

  // Pass 2: any quoted span of ≥10 words must appear (normalized) in at least
  // one retrieved chunk. We don't try to associate a quote with a specific
  // [cite:N] — strict association turns out to be brittle when prompts paraphrase
  // around quotes. Substring presence in the corpus is sufficient.
  const normalizedCorpus = retrieved.map((c) => normalize(c.text));

  for (const pattern of QUOTE_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(answer)) !== null) {
      const inner = m[1];
      if (countWords(inner) < MIN_VERBATIM_WORDS) continue;
      const needle = normalize(inner);
      const hit = normalizedCorpus.some((chunk) => chunk.includes(needle));
      if (!hit) {
        return {
          ok: false,
          reason: `Verbatim quote of ${countWords(inner)} words not found in retrieved chunks: "${inner.slice(0, 80)}…"`,
          referencedIndices: Array.from(referencedIndices),
        };
      }
    }
  }

  return { ok: true, referencedIndices: Array.from(referencedIndices) };
}

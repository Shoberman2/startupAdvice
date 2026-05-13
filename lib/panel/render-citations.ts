/**
 * Shared helper: split a body of text containing [cite:N] markers into a
 * sequence of text and citation parts so the renderer can replace markers
 * with clickable superscript footnotes.
 *
 * Used by both <PanelColumn> (live streaming answers) and <SummaryView>
 * (pre-generated topical summaries).
 */

export type CitationPart =
  | { kind: "text"; text: string }
  | { kind: "cite"; num: number };

export function splitCitations(text: string): CitationPart[] {
  const parts: CitationPart[] = [];
  const re = /\[cite:(\d+)\]/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ kind: "text", text: text.slice(lastIndex, m.index) });
    }
    parts.push({ kind: "cite", num: Number(m[1]) });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ kind: "text", text: text.slice(lastIndex) });
  }
  return parts;
}

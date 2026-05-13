"use client";

import { useState } from "react";
import type { Summary } from "@/lib/summaries";
import { splitCitations } from "@/lib/panel/render-citations";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";

interface SummaryViewProps {
  summary: Summary;
  panelistSlug: string;
  panelistName: string;
}

export function SummaryView({ summary, panelistSlug, panelistName }: SummaryViewProps) {
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);

  // Split the content into paragraphs on \n\n so we can drop-cap the first one.
  // Each paragraph then gets citation-aware rendering.
  const paragraphs = splitParagraphs(summary.content);

  return (
    <>
      <article
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 19,
          lineHeight: 1.65,
          color: "var(--text)",
        }}
      >
        {paragraphs.map((text, i) => {
          const parts = splitCitations(text);
          const isFirst = i === 0;
          return (
            <p
              key={i}
              className={isFirst ? "chapter-dropcap" : undefined}
              style={{
                margin: 0,
                marginBottom: "var(--space-2)",
                whiteSpace: "pre-wrap",
              }}
            >
              {parts.map((p, j) => {
                if (p.kind === "text") return <span key={j}>{p.text}</span>;
                const citation = summary.citations.find((c) => c.index === p.num);
                if (!citation) return <span key={j}>[?]</span>;
                return (
                  <CitationMark
                    key={j}
                    num={p.num}
                    onClick={() =>
                      setDrawer({
                        panelistSlug,
                        postUrl: citation.post_url,
                        paragraphIndex: citation.paragraph_idx,
                      })
                    }
                  />
                );
              })}
            </p>
          );
        })}
      </article>

      <section
        style={{
          marginTop: "var(--space-4)",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--hairline)",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          flexWrap: "wrap",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        <span>
          Sources: {countSources(summary)} {countSources(summary) === 1 ? "essay" : "essays"} ·{" "}
          {summary.citations.length} quoted{" "}
          {summary.citations.length === 1 ? "passage" : "passages"}
        </span>
        <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          {summary.citations.slice(0, 6).map((c) => (
            <a
              key={`${c.post_url}-${c.paragraph_idx}`}
              href={c.post_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
              }}
            >
              [{c.index + 1}]
            </a>
          ))}
          {summary.citations.length > 6 && (
            <span style={{ color: "var(--muted)" }}>+{summary.citations.length - 6} more</span>
          )}
        </span>
      </section>

      <SourceDrawer
        request={drawer}
        panelistName={panelistName}
        onClose={() => setDrawer(null)}
      />

      <style>{`
        .chapter-dropcap::first-letter {
          font-family: var(--font-serif);
          font-size: 64px;
          font-weight: 500;
          float: left;
          line-height: 0.85;
          padding: 6px 10px 0 0;
          color: var(--accent);
        }
      `}</style>
    </>
  );
}

function CitationMark({ num, onClick }: { num: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cite-mark"
      aria-label={`Open source for citation ${num + 1}`}
    >
      [{num + 1}]
    </button>
  );
}

function splitParagraphs(content: string): string[] {
  // Normalize line endings, split on blank lines, drop empties.
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countSources(summary: Summary): number {
  return new Set(summary.citations.map((c) => c.post_url)).size;
}

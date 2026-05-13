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

  const parts = splitCitations(summary.content);

  return (
    <>
      <article
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--type-scale-body)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          color: "var(--text)",
        }}
      >
        {parts.map((part, i) => {
          if (part.kind === "text") return <span key={i}>{part.text}</span>;
          const citation = summary.citations.find((c) => c.index === part.num);
          if (!citation) return <span key={i}>[?]</span>;
          return (
            <CitationMark
              key={i}
              num={part.num}
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
      </article>

      <section
        style={{
          marginTop: "var(--space-3)",
          paddingTop: "var(--space-3)",
          borderTop: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <div
          style={{
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Drawn from
        </div>
        {summary.citations.map((c) => (
          <a
            key={`${c.post_url}-${c.paragraph_idx}`}
            href={c.post_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                marginRight: 6,
                fontSize: 12,
              }}
            >
              [{c.index + 1}]
            </span>
            {c.post_title}
          </a>
        ))}
      </section>

      <SourceDrawer
        request={drawer}
        panelistName={panelistName}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}

function CitationMark({ num, onClick }: { num: number; onClick: () => void }) {
  return (
    <sup
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7em",
        margin: "0 1px",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          background: "transparent",
          color: "var(--accent)",
          border: "none",
          padding: 0,
          font: "inherit",
          cursor: "pointer",
        }}
        aria-label={`Open source for citation ${num + 1}`}
      >
        [{num + 1}]
      </button>
    </sup>
  );
}

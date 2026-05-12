"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_PANELISTS, panelistMeta } from "@/lib/panel/all-panelists";
import { PanelColumn, type ColumnState } from "@/components/PanelColumn";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";

interface SelectResponse {
  author_slugs: string[];
  question_hash: string;
  threshold_misses: string[];
}

interface ApiError {
  error: { code: string; user_message: string; retry_after?: number };
}

export function PanelClient({ question }: { question: string }) {
  const [selection, setSelection] = useState<SelectResponse | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);

  // POST /api/panel/select on mount and whenever the user retries.
  useEffect(() => {
    const ctrl = new AbortController();
    setSelectError(null);
    setSelection(null);

    fetch("/api/panel/select", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => ({}))) as ApiError;
          throw new Error(body.error?.user_message ?? `HTTP ${r.status}`);
        }
        return (await r.json()) as SelectResponse;
      })
      .then((sel) => setSelection(sel))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setSelectError(e instanceof Error ? e.message : String(e));
      });

    return () => ctrl.abort();
  }, [question, retryToken]);

  const columnStates = useMemo(() => buildColumnStates(selection), [selection]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <TopBar />
      <hr />

      <header>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-question)",
            fontWeight: 400,
            lineHeight: 1.25,
          }}
        >
          {question}
        </h1>
        <div
          aria-hidden="true"
          style={{
            width: 48,
            height: 2,
            background: "var(--accent)",
            marginTop: 8,
          }}
        />
      </header>

      {selectError && (
        <div
          role="alert"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--muted)",
            fontSize: "var(--type-scale-meta)",
          }}
        >
          {selectError}{" "}
          <button type="button" onClick={() => setRetryToken((t) => t + 1)}>
            Try again
          </button>
        </div>
      )}

      <ThresholdBanner selection={selection} />

      <Columns
        columnStates={columnStates}
        question={question}
        questionHash={selection?.question_hash}
        selection={selection}
        onCitationClick={(req) =>
          setDrawer({
            panelistSlug: req.panelistSlug,
            postUrl: req.postUrl,
            paragraphIndex: req.paragraphIndex,
          })
        }
        onRetryColumn={() => setRetryToken((t) => t + 1)}
      />

      <SourceDrawer
        request={drawer}
        panelistName={drawer ? panelistMeta(drawer.panelistSlug).name : ""}
        onClose={() => setDrawer(null)}
      />
    </main>
  );
}

function TopBar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <a
        href="/"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          color: "var(--accent)",
        }}
      >
        Founder Panel
      </a>
      <a
        href="/"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--type-scale-meta)",
          color: "var(--muted)",
        }}
      >
        Ask another →
      </a>
    </div>
  );
}

function ThresholdBanner({ selection }: { selection: SelectResponse | null }) {
  if (!selection) return null;
  const chosen = selection.author_slugs.length;
  if (chosen >= 3) return null;
  return (
    <div
      role="status"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--type-scale-meta)",
        color: "var(--muted)",
        fontStyle: "italic",
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        padding: "var(--space-1) 0",
      }}
    >
      Only {chosen} {chosen === 1 ? "panelist" : "panelists"} responded — this question
      is outside the corpus.
    </div>
  );
}

function buildColumnStates(selection: SelectResponse | null): Record<string, ColumnState> {
  if (!selection) {
    return Object.fromEntries(
      ALL_PANELISTS.map((p) => [p.slug, { kind: "pending" } as ColumnState]),
    );
  }
  const chosen = new Set(selection.author_slugs);
  return Object.fromEntries(
    ALL_PANELISTS.map((p) => {
      const state: ColumnState = chosen.has(p.slug)
        ? { kind: "streaming", partial: {} }
        : { kind: "unchosen" };
      return [p.slug, state];
    }),
  );
}

function Columns(props: {
  columnStates: Record<string, ColumnState>;
  question: string;
  questionHash: string | undefined;
  selection: SelectResponse | null;
  onCitationClick: (r: DrawerRequest) => void;
  onRetryColumn: () => void;
}) {
  const { columnStates, question, questionHash, selection, onCitationClick, onRetryColumn } =
    props;
  const containerRef = useRef<HTMLDivElement>(null);

  // Until /select returns, render the 5 tier-A + first tier-B panelists as
  // placeholder slots (at opacity 0.25 via pending state). Once selection is
  // known, render the 5 chosen panelists in the same grid slots.
  const renderedSlugs: string[] = selection
    ? selection.author_slugs
    : ALL_PANELISTS.slice(0, 5).map((p) => p.slug);

  return (
    <div
      ref={containerRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "var(--space-4)",
      }}
    >
      {renderedSlugs.map((slug) => {
        const meta = panelistMeta(slug);
        const state = columnStates[slug] ?? { kind: "pending" };
        return (
          <PanelColumn
            key={slug}
            meta={meta}
            state={state}
            question={question}
            questionHash={questionHash}
            onCitationClick={onCitationClick}
            onRetry={onRetryColumn}
          />
        );
      })}
    </div>
  );
}

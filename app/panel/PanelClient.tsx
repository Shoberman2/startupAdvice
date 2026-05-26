"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AdviceContext,
  formatAdviceContext,
  hasAdviceContext,
} from "@/lib/advice-context";
import { ALL_PANELISTS, panelistMeta } from "@/lib/panel/all-panelists";
import {
  PanelColumn,
  type ColumnState,
  type PanelResponse,
} from "@/components/PanelColumn";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";

interface SelectResponse {
  author_slugs: string[];
  question_hash: string;
  threshold_misses: string[];
}

interface ApiError {
  error: { code: string; user_message: string; retry_after?: number };
}

const SELECT_TIMEOUT_MS = 30_000;

export function PanelClient({
  question,
  adviceContext,
}: {
  question: string;
  adviceContext: AdviceContext;
}) {
  const [selection, setSelection] = useState<SelectResponse | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);
  const [finishedResponses, setFinishedResponses] = useState<Record<string, PanelResponse>>({});
  const contextSummary = useMemo(() => formatAdviceContext(adviceContext), [adviceContext]);
  const contextQuery = useMemo(
    () => encodeURIComponent(JSON.stringify(adviceContext)),
    [adviceContext],
  );

  // POST /api/panel/select on mount and whenever the user retries.
  useEffect(() => {
    const ctrl = new AbortController();
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, SELECT_TIMEOUT_MS);
    setSelectError(null);
    setSelection(null);

    fetch("/api/panel/select", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, context: adviceContext }),
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
        if ((e as Error).name === "AbortError" && !timedOut) return;
        if (timedOut) {
          setSelectError("The panel is taking too long to assemble. Try again in a moment.");
          return;
        }
        setSelectError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      ctrl.abort();
    };
  }, [question, adviceContext, retryToken]);

  const columnStates = useMemo(() => buildColumnStates(selection), [selection]);
  const handleFinished = useCallback((panelistSlug: string, response: PanelResponse) => {
    setFinishedResponses((current) => ({
      ...current,
      [panelistSlug]: response,
    }));
  }, []);

  useEffect(() => {
    setFinishedResponses({});
  }, [question, adviceContext, retryToken]);

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
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 6 }}>
          AI research agent
        </div>
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
        <p
          style={{
            margin: "var(--space-2) 0 0",
            maxWidth: 760,
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            lineHeight: 1.45,
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          These are AI-generated research notes from public founder sources, not
          live replies from the founders. Citations show what the corpus supports.
        </p>
      </header>

      <ContextStrip context={adviceContext} summary={contextSummary} />

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
        adviceContextQuery={contextQuery}
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
        onFinished={handleFinished}
      />

      <DecisionMemo
        question={question}
        selection={selection}
        responses={finishedResponses}
      />

      <SourceDrawer
        request={drawer}
        panelistName={drawer ? panelistMeta(drawer.panelistSlug).name : ""}
        onClose={() => setDrawer(null)}
      />
    </main>
  );
}

function ContextStrip({
  context,
  summary,
}: {
  context: AdviceContext;
  summary: string;
}) {
  const populated = hasAdviceContext(context);

  return (
    <section
      style={{
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        padding: "var(--space-2) 0",
        display: "grid",
        gridTemplateColumns: "minmax(120px, 0.2fr) 1fr",
        gap: "var(--space-2)",
      }}
    >
      <div className="smallcaps">Situation</div>
      <p
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          lineHeight: 1.45,
          color: populated ? "var(--text)" : "var(--muted)",
          fontStyle: populated ? "normal" : "italic",
        }}
      >
        {summary}
      </p>
    </section>
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
  adviceContextQuery: string;
  questionHash: string | undefined;
  selection: SelectResponse | null;
  onCitationClick: (r: DrawerRequest) => void;
  onRetryColumn: () => void;
  onFinished: (panelistSlug: string, response: PanelResponse) => void;
}) {
  const {
    columnStates,
    question,
    adviceContextQuery,
    questionHash,
    selection,
    onCitationClick,
    onRetryColumn,
    onFinished,
  } = props;
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
            adviceContextQuery={adviceContextQuery}
            questionHash={questionHash}
            onCitationClick={onCitationClick}
            onRetry={onRetryColumn}
            onFinished={onFinished}
          />
        );
      })}
    </div>
  );
}

function DecisionMemo({
  question,
  selection,
  responses,
}: {
  question: string;
  selection: SelectResponse | null;
  responses: Record<string, PanelResponse>;
}) {
  if (!selection) return null;

  const finished = selection.author_slugs
    .map((slug) => ({ slug, response: responses[slug] }))
    .filter((item): item is { slug: string; response: PanelResponse } => Boolean(item.response));

  const usable = finished.filter((item) => !item.response.opted_out);
  const nextMoves = unique(
    usable.flatMap((item) => item.response.next_steps ?? []).filter(Boolean),
  ).slice(0, 5);

  return (
    <section
      style={{
        marginTop: "var(--space-3)",
        paddingTop: "var(--space-3)",
        borderTop: "2px solid var(--text)",
        display: "grid",
        gridTemplateColumns: "minmax(180px, 0.32fr) 1fr",
        gap: "var(--space-3)",
      }}
    >
      <div>
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 6 }}>
          Decision memo
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          {finished.length < selection.author_slugs.length
            ? "Assembling public-source signals"
            : "Source-backed next move"}
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--muted)",
          }}
        >
          {usable.length
            ? `Working memo for "${question}" based on ${usable.length} AI-researched ${usable.length === 1 ? "source view" : "source views"}.`
            : "AI research notes will turn into a memo here as they finish."}
        </p>

        {usable.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            <MemoBlock
              title="Best-supported advice"
              items={usable.map((item) => {
                const meta = panelistMeta(item.slug);
                return `${meta.name}: ${item.response.recommendation || item.response.answer}`;
              })}
            />
            <MemoBlock
              title="Tensions to notice"
              items={usable.map((item) => {
                const meta = panelistMeta(item.slug);
                return `${meta.name}: ${item.response.weighing || item.response.interpretation || "No explicit tension yet."}`;
              })}
            />
            <MemoBlock title="Next actions" items={nextMoves} ordered />
          </div>
        )}
      </div>
    </section>
  );
}

function MemoBlock({
  title,
  items,
  ordered,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const visible = items.filter(Boolean).slice(0, ordered ? 5 : 3);
  if (!visible.length) return null;
  const List = ordered ? "ol" : "ul";

  return (
    <div>
      <div className="smallcaps" style={{ marginBottom: 6 }}>
        {title}
      </div>
      <List
        style={{
          margin: 0,
          paddingLeft: "1.1em",
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          lineHeight: 1.45,
        }}
      >
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </div>
  );
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

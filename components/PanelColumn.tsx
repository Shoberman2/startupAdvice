"use client";

import { useEffect, useRef, useState } from "react";
import type { PanelistMeta } from "@/lib/panel/all-panelists";
import { consumeObjectStream } from "@/lib/panel/partial-json";
import { splitCitations } from "@/lib/panel/render-citations";
import { PinButton } from "@/components/PinButton";

/** Server schema mirror — kept in sync with PanelResponseSchema in the route. */
export interface PanelResponse {
  retrieved: { index: number; title: string; url: string; paragraph_idx: number }[];
  receipts?: { citation_index: number; claim: string }[];
  weighing: string;
  interpretation?: string;
  recommendation?: string;
  next_steps?: string[];
  answer: string;
  opted_out?: { reason: string };
}

export type ColumnState =
  /** /select hasn't returned yet — render at low opacity. */
  | { kind: "pending" }
  /** /select returned and we are NOT one of the 5 chosen — fade to 0. */
  | { kind: "unchosen" }
  /** We are chosen and our stream is running. */
  | { kind: "streaming"; partial: Partial<PanelResponse> }
  /** Stream complete. */
  | { kind: "done"; final: PanelResponse }
  /** Stream errored. */
  | { kind: "error"; message: string };

export interface PanelColumnProps {
  meta: PanelistMeta;
  state: ColumnState;
  question: string;
  questionHash?: string;
  adviceContextQuery?: string;
  onCitationClick: (citation: {
    panelistSlug: string;
    postUrl: string;
    paragraphIndex: number;
  }) => void;
  onRetry: () => void;
  onFinished?: (panelistSlug: string, response: PanelResponse) => void;
}

export function PanelColumn(props: PanelColumnProps) {
  const {
    meta,
    state,
    question,
    questionHash,
    adviceContextQuery,
    onCitationClick,
    onRetry,
    onFinished,
  } = props;
  const [streamState, setStreamState] = useState<ColumnState>(state);
  const abortRef = useRef<AbortController | null>(null);

  // External state (pending/unchosen) wins until the parent says we're streaming.
  useEffect(() => {
    if (state.kind !== "streaming") setStreamState(state);
  }, [state]);

  // Kick off the stream when we transition to streaming and have a question hash.
  useEffect(() => {
    if (state.kind !== "streaming" || !questionHash) return;

    const url = `/api/panel/${meta.slug}?qh=${encodeURIComponent(
      questionHash,
    )}&q=${encodeURIComponent(question)}${adviceContextQuery ? `&ctx=${adviceContextQuery}` : ""}`;

    abortRef.current?.abort();
    const ctrl = consumeObjectStream<PanelResponse>(url, {
      onUpdate: (partial) => setStreamState({ kind: "streaming", partial }),
      onDone: (final) => {
        if (!final) {
          setStreamState({ kind: "error", message: "Empty response" });
        } else {
          setStreamState({ kind: "done", final });
          onFinished?.(meta.slug, final);
        }
      },
      onError: (err) =>
        setStreamState({ kind: "error", message: err.message || "Connection lost" }),
    });
    abortRef.current = ctrl;
    return () => ctrl.abort();
  }, [state.kind, questionHash, meta.slug, question, adviceContextQuery, onFinished]);

  // Opacity for the prerender-then-fade loading pattern.
  const opacity =
    streamState.kind === "pending"
      ? 0.25
      : streamState.kind === "unchosen"
        ? 0
        : 1;

  const streaming =
    streamState.kind === "streaming" && !streamState.partial.opted_out;

  return (
    <article
      aria-label={`${meta.name} — ${meta.era}`}
      aria-live="polite"
      aria-atomic="false"
      style={{
        opacity,
        transition: "opacity var(--duration-fast) var(--ease)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        minWidth: 0,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Avatar alt={meta.name} />
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
            color: "var(--text)",
            fontWeight: 600,
            marginTop: "var(--space-1)",
          }}
        >
          {meta.name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {meta.era}
        </div>
        <div className="streaming-underline" data-streaming={String(streaming)} />
      </header>

      <ColumnBody
        state={streamState}
        panelistSlug={meta.slug}
        onCitationClick={onCitationClick}
        onRetry={onRetry}
      />

      {streamState.kind === "done" &&
        !streamState.final.opted_out &&
        streamState.final.answer && (
          <PinButton
            founderSlug={meta.slug}
            founderName={meta.name}
            questionText={question}
            answerText={streamState.final.answer}
            source="/panel"
          />
        )}
    </article>
  );
}

function Avatar({ alt }: { alt: string }) {
  // The panel can run before avatar PNGs have been generated. Render a stable
  // local placeholder so missing files do not create noisy 404s.
  return (
    <div
      style={{
        width: 72,
        height: 72,
        background: "var(--hairline)",
        borderRadius: 0,
        border: "1px solid var(--hairline-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-serif)",
        fontSize: 22,
        color: "var(--accent)",
        letterSpacing: 0,
      }}
      role="img"
      aria-label={alt}
      title={alt}
    >
      {initials(alt)}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function ColumnBody(props: {
  state: ColumnState;
  panelistSlug: string;
  onCitationClick: PanelColumnProps["onCitationClick"];
  onRetry: () => void;
}) {
  const { state, panelistSlug, onCitationClick, onRetry } = props;

  if (state.kind === "pending" || state.kind === "unchosen") return null;

  if (state.kind === "error") {
    return (
      <div
        role="status"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--type-scale-meta)",
          color: "var(--muted)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <div>Connection lost.</div>
        <button type="button" onClick={onRetry} style={{ alignSelf: "flex-start" }}>
          Retry
        </button>
      </div>
    );
  }

  const data: Partial<PanelResponse> =
    state.kind === "done" ? state.final : state.partial;

  if (data.opted_out) {
    return (
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--type-scale-meta)",
          color: "var(--muted)",
          fontStyle: "italic",
        }}
      >
        {data.opted_out.reason === "citation_validation_failed"
          ? "Withheld — citations didn't verify."
          : data.opted_out.reason === "no_relevant_chunks"
            ? "Hasn't written on this."
            : "Stepped back from this one."}
      </div>
    );
  }

  return (
    <>
      <Reasoning retrieved={data.retrieved ?? []} weighing={data.weighing ?? ""} />
      <Receipts
        receipts={data.receipts ?? []}
        retrieved={data.retrieved ?? []}
        panelistSlug={panelistSlug}
        onCitationClick={onCitationClick}
      />
      <AdviceSections
        interpretation={data.interpretation ?? ""}
        recommendation={data.recommendation ?? ""}
        nextSteps={data.next_steps ?? []}
      />
      <AnswerBody
        text={data.answer ?? ""}
        retrieved={data.retrieved ?? []}
        panelistSlug={panelistSlug}
        onCitationClick={onCitationClick}
      />
    </>
  );
}

function Receipts(props: {
  receipts: NonNullable<PanelResponse["receipts"]>;
  retrieved: PanelResponse["retrieved"];
  panelistSlug: string;
  onCitationClick: PanelColumnProps["onCitationClick"];
}) {
  const { receipts, retrieved, panelistSlug, onCitationClick } = props;
  if (!receipts.length) return null;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div className="smallcaps">Receipts</div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          lineHeight: 1.45,
        }}
      >
        {receipts.slice(0, 3).map((receipt, i) => {
          const citationIndex = Number.isFinite(receipt.citation_index)
            ? receipt.citation_index
            : i;
          const source = retrieved[citationIndex];
          return (
            <li key={`${receipt.claim}-${i}`}>
              <span style={{ color: "var(--muted)", marginRight: 6 }}>·</span>
              {receipt.claim}
              {source && (
                <CitationMark
                  num={citationIndex}
                  onClick={() =>
                    onCitationClick({
                      panelistSlug,
                      postUrl: source.url,
                      paragraphIndex: source.paragraph_idx,
                    })
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AdviceSections(props: {
  interpretation: string;
  recommendation: string;
  nextSteps: string[];
}) {
  const { interpretation, recommendation, nextSteps } = props;
  if (!interpretation && !recommendation && !nextSteps.length) return null;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      {interpretation && (
        <AdviceBlock label="Interpretation" text={interpretation} />
      )}
      {recommendation && (
        <AdviceBlock label="Advice" text={recommendation} strong />
      )}
      {nextSteps.length > 0 && (
        <div>
          <div className="smallcaps" style={{ marginBottom: 4 }}>
            Next moves
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.2em",
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              lineHeight: 1.45,
            }}
          >
            {nextSteps.slice(0, 4).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function AdviceBlock({
  label,
  text,
  strong,
}: {
  label: string;
  text: string;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="smallcaps" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: strong ? 18 : 16,
          lineHeight: 1.5,
          color: "var(--text)",
          fontWeight: strong ? 500 : 400,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function Reasoning(props: {
  retrieved: PanelResponse["retrieved"];
  weighing: string;
}) {
  const { retrieved, weighing } = props;
  if (!retrieved.length && !weighing) return null;

  return (
    <section
      style={{
        borderTop: "1px solid var(--hairline)",
        borderBottom: "1px solid var(--hairline)",
        padding: "var(--space-2) 0",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--muted)",
      }}
    >
      {retrieved.map((r, i) => (
        <div
          key={`${r.url}-${i}`}
          style={{
            transition: "opacity var(--duration-fast) var(--ease)",
          }}
        >
          <span style={{ marginRight: 6, color: "var(--accent)" }}>·</span>
          {r.title ?? "Untitled"}
        </div>
      ))}
      {weighing && (
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--text)",
            marginTop: "var(--space-1)",
            fontSize: 15,
          }}
        >
          {weighing}
        </div>
      )}
    </section>
  );
}

function AnswerBody(props: {
  text: string;
  retrieved: PanelResponse["retrieved"];
  panelistSlug: string;
  onCitationClick: PanelColumnProps["onCitationClick"];
}) {
  const { text, retrieved, panelistSlug, onCitationClick } = props;
  if (!text) return null;

  // Replace [cite:N] markers with clickable superscript citations. Stream-friendly:
  // a partial marker like "[cite:" at the buffer tail gets rendered as text and
  // replaced on the next update — no flicker because we don't render until after
  // partial-json parses an updated answer field.
  const parts = splitCitations(text);

  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-serif)",
        fontSize: "var(--type-scale-body)",
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        color: "var(--text)",
      }}
    >
      {parts.map((part, i) =>
        part.kind === "text" ? (
          <span key={i}>{part.text}</span>
        ) : (
          <CitationMark
            key={i}
            num={part.num}
            onClick={() => {
              const r = retrieved[part.num];
              if (!r) return;
              onCitationClick({
                panelistSlug,
                postUrl: r.url,
                paragraphIndex: r.paragraph_idx,
              });
            }}
          />
        ),
      )}
    </p>
  );
}

function CitationMark({ num, onClick }: { num: number; onClick: () => void }) {
  return (
    <sup
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7em",
        color: "var(--accent)",
        margin: "0 1px",
        cursor: "pointer",
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

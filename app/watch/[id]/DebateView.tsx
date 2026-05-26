"use client";

import { useEffect, useRef, useState } from "react";
import type { DebateMessage, DebateSession } from "@/lib/debates";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { splitCitations } from "@/lib/panel/render-citations";
import { SourceDrawer, type DrawerRequest } from "@/components/SourceDrawer";

interface DebateResponse {
  session: DebateSession;
  messages: DebateMessage[];
}

export function DebateView({ debateId }: { debateId: string }) {
  const [data, setData] = useState<DebateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);
  const messageCountRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let pollHandle: ReturnType<typeof setTimeout> | null = null;
    let scrollHandle: ReturnType<typeof setTimeout> | null = null;
    let ctrl: AbortController | null = null;

    async function load() {
      ctrl?.abort();
      ctrl = new AbortController();
      try {
        const r = await fetch(`/api/debates/${encodeURIComponent(debateId)}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!r.ok) {
          if (r.status === 404) {
            if (!cancelled) setError("This debate doesn't exist.");
            return;
          }
          throw new Error(`HTTP ${r.status}`);
        }
        const next = (await r.json()) as DebateResponse;
        if (cancelled) return;
        setData(next);
        setError(null);

        if (next.messages.length > messageCountRef.current) {
          messageCountRef.current = next.messages.length;
          if (scrollHandle) clearTimeout(scrollHandle);
          scrollHandle = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }

        if (next.session.status === "active") {
          pollHandle = setTimeout(load, 20_000);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        pollHandle = setTimeout(load, 30_000);
      }
    }

    load();

    return () => {
      cancelled = true;
      ctrl?.abort();
      if (pollHandle) clearTimeout(pollHandle);
      if (scrollHandle) clearTimeout(scrollHandle);
    };
  }, [debateId]);

  if (error) {
    return (
      <div
        role="alert"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          color: "var(--text)",
          borderLeft: "2px solid var(--accent)",
          paddingLeft: "var(--space-2)",
        }}
      >
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
          Error
        </div>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ color: "var(--muted)", fontStyle: "italic", padding: "var(--space-3) 0" }}>
        Loading…
      </div>
    );
  }

  const { session, messages } = data;
  const isActive = session.status === "active";
  // The last message is "currently writing" only if the debate is still active
  // AND turnCount < maxTurns (i.e., we expect another turn after it). When the
  // debate hits its cap or concludes, the last message is just the last message.
  const lastMessageIsActive = isActive && messages.length > 0 && session.turnCount < session.maxTurns;
  const expectingFirstTurn = isActive && messages.length === 0;

  return (
    <>
      <section
        style={{
          paddingBottom: "var(--space-2)",
          borderBottom: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          className="smallcaps"
          style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
        >
          {isActive && <span className="pulse-dot" />}
          {isActive
            ? `Live debate · turn ${session.turnCount} of ${session.maxTurns}`
            : `Concluded · ${session.turnCount} ${session.turnCount === 1 ? "turn" : "turns"}`}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
          }}
        >
          {session.topic}
        </h1>
        <div className="mono-meta">
          {new Date(session.startedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {" · "}
          {session.founders.map(safeName).join(", ")}
        </div>
      </section>

      <section
        aria-live="polite"
        aria-atomic="false"
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "var(--space-2)",
        }}
      >
        {expectingFirstTurn && (
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--muted)",
              margin: "var(--space-3) 0",
            }}
          >
            Seeded. First turn lands at the next cron tick.
          </p>
        )}

        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const writing = lastMessageIsActive && isLast;
          return (
            <Turn
              key={m.id}
              message={m}
              writing={writing}
              onCitationClick={(citation) =>
                setDrawer({
                  panelistSlug: m.founderSlug,
                  postUrl: citation.post_url,
                  paragraphIndex: citation.paragraph_idx,
                })
              }
            />
          );
        })}

        {isActive && messages.length > 0 && !lastMessageIsActive && (
          <div
            className="mono-meta"
            style={{
              padding: "var(--space-2) 0 0",
              borderTop: "1px solid var(--hairline)",
              marginTop: "var(--space-2)",
              fontStyle: "italic",
            }}
          >
            Waiting for the next turn. New messages appear every ~15 minutes.
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      <SourceDrawer
        request={drawer}
        panelistName={drawer ? safeName(drawer.panelistSlug) : ""}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}

function Turn({
  message,
  writing,
  onCitationClick,
}: {
  message: DebateMessage;
  writing: boolean;
  onCitationClick: (c: DebateMessage["citations"][number]) => void;
}) {
  const name = safeName(message.founderSlug);
  const era = safeEra(message.founderSlug);
  const parts = splitCitations(message.content);

  return (
    <article
      style={{
        padding: "var(--space-2) var(--space-2) var(--space-2) var(--space-3)",
        margin: "var(--space-2) 0",
        borderLeft: `2px solid ${writing ? "var(--accent)" : "transparent"}`,
        background: writing ? "var(--accent-soft)" : "transparent",
        transition: "background var(--duration-fast) var(--ease)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "var(--space-1)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          {name}
        </span>
        {era && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
            }}
          >
            {era}
          </span>
        )}
        {writing && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontStyle: "italic",
              fontSize: 10,
              color: "var(--accent)",
            }}
          >
            writing…
          </span>
        )}
      </header>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          lineHeight: 1.6,
          color: "var(--text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {parts.map((p, i) =>
          p.kind === "text" ? (
            <span key={i}>{p.text}</span>
          ) : (
            <CitationMark
              key={i}
              num={p.num}
              onClick={() => {
                const c = message.citations.find((x) => x.index === p.num);
                if (c) onCitationClick(c);
              }}
            />
          ),
        )}
        {writing && <span className="stream-caret" aria-hidden="true" />}
      </div>
    </article>
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

function safeName(slug: string): string {
  try {
    return panelistMeta(slug).name;
  } catch {
    return slug;
  }
}

function safeEra(slug: string): string {
  try {
    return panelistMeta(slug).era;
  } catch {
    return "";
  }
}

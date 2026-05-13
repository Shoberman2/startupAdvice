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

    async function load() {
      try {
        const r = await fetch(`/api/debates/${encodeURIComponent(debateId)}`, {
          cache: "no-store",
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

        // Auto-scroll only if a NEW message arrived since the last poll.
        if (next.messages.length > messageCountRef.current) {
          messageCountRef.current = next.messages.length;
          // Small delay so the new DOM lands first.
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }

        // Continue polling while the debate is active. Concluded debates
        // are static — stop polling to save bandwidth.
        if (next.session.status === "active") {
          pollHandle = setTimeout(load, 20_000);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        pollHandle = setTimeout(load, 30_000);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (pollHandle) clearTimeout(pollHandle);
    };
  }, [debateId]);

  if (error) {
    return (
      <div role="alert" style={{ color: "var(--muted)", fontStyle: "italic" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "var(--muted)", fontStyle: "italic" }}>Loading…</div>;
  }

  const { session, messages } = data;

  return (
    <>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {session.status === "active"
            ? `Active · Turn ${session.turnCount}/${session.maxTurns}`
            : `Concluded · ${session.turnCount} turns`}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          {session.topic}
        </h1>
        <FounderRoster founders={session.founders} />
      </section>

      <hr />

      <section
        aria-live="polite"
        aria-atomic="false"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            Just seeded. First turn lands at the next cron tick.
          </div>
        )}

        {messages.map((m) => (
          <DebateMessageView
            key={m.id}
            message={m}
            onCitationClick={(citation) =>
              setDrawer({
                panelistSlug: m.founderSlug,
                postUrl: citation.post_url,
                paragraphIndex: citation.paragraph_idx,
              })
            }
          />
        ))}

        {session.status === "active" && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--muted)",
              fontStyle: "italic",
              paddingTop: "var(--space-1)",
              borderTop: "1px solid var(--hairline)",
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

function FounderRoster({ founders }: { founders: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        marginTop: "var(--space-1)",
      }}
    >
      <div style={{ display: "flex" }}>
        {founders.map((slug, i) => (
          <div
            key={slug}
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              background: "var(--hairline)",
              backgroundImage: `url(${safeAvatar(slug)})`,
              backgroundSize: "cover",
              marginLeft: i === 0 ? 0 : -8,
              outline: "1px solid var(--bg)",
              position: "relative",
              zIndex: founders.length - i,
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)" }}>
        {founders.map(safeName).join(" · ")}
      </span>
    </div>
  );
}

function DebateMessageView({
  message,
  onCitationClick,
}: {
  message: DebateMessage;
  onCitationClick: (c: DebateMessage["citations"][number]) => void;
}) {
  const name = safeName(message.founderSlug);
  const parts = splitCitations(message.content);

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            background: "var(--hairline)",
            backgroundImage: `url(${safeAvatar(message.founderSlug)})`,
            backgroundSize: "cover",
          }}
        />
        <span style={{ color: "var(--text)", letterSpacing: "0.02em" }}>{name}</span>
        <span aria-hidden="true">·</span>
        <span>Turn {message.turnIndex + 1}</span>
        {message.respondsTo.length > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>↳ {message.respondsTo.map((t) => `turn ${t + 1}`).join(", ")}</span>
          </>
        )}
      </header>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--type-scale-body)",
          lineHeight: 1.55,
          color: "var(--text)",
          paddingLeft: "var(--space-3)",
          borderLeft: "2px solid var(--accent)",
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
      </div>
    </article>
  );
}

function CitationMark({ num, onClick }: { num: number; onClick: () => void }) {
  return (
    <sup style={{ fontFamily: "var(--font-mono)", fontSize: "0.7em", margin: "0 1px" }}>
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

function safeName(slug: string): string {
  try {
    return panelistMeta(slug).name;
  } catch {
    return slug;
  }
}

function safeAvatar(slug: string): string {
  try {
    return panelistMeta(slug).avatarPath;
  } catch {
    return "";
  }
}

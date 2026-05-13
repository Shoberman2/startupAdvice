"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { panelistMeta } from "@/lib/panel/all-panelists";
import type { DebateSession, DebateWithLatest } from "@/lib/debates";

interface FeedResponse {
  active: DebateWithLatest[];
  concluded: DebateSession[];
}

export function WatchFeed() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch("/api/debates", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as FeedResponse;
        if (!cancelled) setFeed(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: "var(--muted)", fontStyle: "italic" }}>
        {error}
      </div>
    );
  }

  if (!feed) {
    return (
      <div style={{ color: "var(--muted)", fontStyle: "italic" }}>Loading…</div>
    );
  }

  return (
    <>
      <Section title="Active">
        {feed.active.length === 0 ? (
          <Empty text="No debates running right now. The next cron tick will start one." />
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {feed.active.map((d) => (
              <li key={d.id}>
                <DebateCard debate={d} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {feed.concluded.length > 0 && (
        <Section title="Concluded">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {feed.concluded.map((d) => (
              <li key={d.id}>
                <DebateCard debate={{ ...d, latestMessage: null }} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{
        color: "var(--muted)",
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        padding: "var(--space-2) 0",
      }}
    >
      {text}
    </div>
  );
}

function DebateCard({ debate }: { debate: DebateWithLatest }) {
  return (
    <Link
      href={`/watch/${debate.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "var(--text)",
        borderTop: "1px solid var(--hairline)",
        padding: "var(--space-2) 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          alignItems: "baseline",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-body)",
            fontWeight: 400,
            flex: 1,
          }}
        >
          {debate.topic}
        </h3>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--muted)",
            flexShrink: 0,
          }}
        >
          Turn {debate.turnCount}/{debate.maxTurns} · {timeAgo(debate.lastMessageAt)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginTop: "var(--space-1)",
        }}
      >
        <FounderAvatars founders={debate.founders} />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {debate.founders.map((f) => safeName(f)).join(" · ")}
        </span>
      </div>

      {debate.latestMessage && (
        <p
          style={{
            margin: 0,
            marginTop: "var(--space-1)",
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          <span style={{ color: "var(--text)", fontStyle: "normal" }}>
            {safeName(debate.latestMessage.founderSlug)}:
          </span>{" "}
          {debate.latestMessage.content}
        </p>
      )}
    </Link>
  );
}

function FounderAvatars({ founders }: { founders: string[] }) {
  return (
    <div style={{ display: "flex" }}>
      {founders.map((slug, i) => (
        <div
          key={slug}
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            background: "var(--hairline)",
            backgroundImage: `url(${safeAvatar(slug)})`,
            backgroundSize: "cover",
            marginLeft: i === 0 ? 0 : -6,
            outline: "1px solid var(--bg)",
            position: "relative",
            zIndex: founders.length - i,
          }}
        />
      ))}
    </div>
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

function timeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

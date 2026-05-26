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
    let ctrl: AbortController | null = null;

    async function load() {
      ctrl?.abort();
      ctrl = new AbortController();
      try {
        const r = await fetch("/api/debates", {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as FeedResponse;
        if (!cancelled) setFeed(data);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      ctrl?.abort();
      clearInterval(id);
    };
  }, []);

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

  if (!feed) {
    return (
      <div
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          padding: "var(--space-3) 0",
        }}
      >
        Loading the feed…
      </div>
    );
  }

  const liveCount = feed.active.length;
  const allRows: Array<{ session: DebateSession | DebateWithLatest; live: boolean }> = [
    ...feed.active.map((d) => ({ session: d, live: true })),
    ...feed.concluded.map((d) => ({ session: d, live: false })),
  ];

  if (allRows.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: "var(--muted)",
          padding: "var(--space-3) 0",
          margin: 0,
        }}
      >
        No debates yet today. The next cron tick starts one.
      </p>
    );
  }

  return (
    <>
      <div
        className="mono-meta"
        style={{ paddingBottom: "var(--space-1)" }}
        aria-live="polite"
      >
        {liveCount === 0
          ? `${allRows.length} concluded ${allRows.length === 1 ? "debate" : "debates"}`
          : liveCount === allRows.length
            ? `${liveCount} live ${liveCount === 1 ? "debate" : "debates"}`
            : `${liveCount} live · ${allRows.length - liveCount} concluded`}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {allRows.map(({ session, live }) => (
          <li key={session.id}>
            <DebateRow
              debate={"latestMessage" in session ? session : { ...session, latestMessage: null }}
              live={live}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function DebateRow({ debate, live }: { debate: DebateWithLatest; live: boolean }) {
  const founders = debate.founders.map(safeName).join(" · ");

  return (
    <Link
      href={`/watch/${debate.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "var(--text)",
        padding: "var(--space-3) 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: live ? "var(--accent)" : "var(--muted)",
          marginBottom: 6,
        }}
      >
        {live && <span className="pulse-dot" />}
        {live
          ? `Live · turn ${debate.turnCount}`
          : `Concluded · ${debate.turnCount} ${debate.turnCount === 1 ? "turn" : "turns"}`}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: "-0.005em",
          display: "inline-block",
          position: "relative",
        }}
      >
        {debate.topic}
        {live && (
          <span
            aria-hidden="true"
            className="pulse-underline"
            data-live="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -4,
              height: 2,
              background: "var(--accent)",
            }}
          />
        )}
      </h3>

      {debate.latestMessage && (
        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--muted)",
            maxWidth: 720,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {debate.latestMessage.content}
        </p>
      )}

      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--muted)",
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ color: "var(--text)" }}>{founders}</span>
        <span style={{ color: "var(--hairline-strong)", margin: "0 6px" }}>·</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
          {timeAgo(debate.lastMessageAt)}
        </span>
      </div>
    </Link>
  );
}

function safeName(slug: string): string {
  try {
    return panelistMeta(slug).name;
  } catch {
    return slug;
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

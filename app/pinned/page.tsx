"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { listPinned, unpin, type PinnedItem } from "@/lib/pinned/storage";

interface GroupedPins {
  founderSlug: string;
  founderName: string;
  items: PinnedItem[];
}

function groupByFounder(items: PinnedItem[]): GroupedPins[] {
  const map = new Map<string, GroupedPins>();
  for (const item of items) {
    const existing = map.get(item.founderSlug);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.founderSlug, {
        founderSlug: item.founderSlug,
        founderName: item.founderName,
        items: [item],
      });
    }
  }
  return Array.from(map.values());
}

export default function PinnedPage() {
  const [items, setItems] = useState<PinnedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(listPinned());
  }, []);

  function handleUnpin(id: string) {
    if (unpin(id)) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const grouped = groupByFounder(items);

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "var(--space-3)",
        maxWidth: 820,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <SiteHeader active="pinned" />

      <section
        style={{
          paddingBottom: "var(--space-2)",
          borderBottom: "2px solid var(--text)",
          marginTop: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
          Your notebook
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.005em",
          }}
        >
          Pinned
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
          }}
        >
          Advice you saved. Lives in this browser only — no account, no server.
        </p>
      </section>

      {mounted && items.length === 0 && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--muted)",
            margin: 0,
            padding: "var(--space-5) 0",
            fontSize: 17,
          }}
        >
          Nothing pinned yet. Ask the panel or a single founder a question, then
          click <code style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>+ Pin this</code>{" "}
          next to any answer you want to keep.
        </p>
      )}

      {grouped.map((group) => (
        <section key={group.founderSlug} style={{ marginTop: "var(--space-3)" }}>
          <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
            {group.items.length} pinned
          </div>
          <h2
            style={{
              margin: "0 0 var(--space-2)",
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            <Link
              href={`/founders/${group.founderSlug}`}
              style={{ color: "var(--text)", textDecoration: "none" }}
            >
              {group.founderName}
            </Link>
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {group.items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: "var(--space-2) 0",
                  borderBottom: "1px dotted var(--hairline)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  Q · {item.questionText}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: "var(--text)",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.answerText}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    alignItems: "baseline",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    marginTop: 4,
                  }}
                >
                  <span>{formatDate(item.pinnedAt)}</span>
                  <span>{item.source}</span>
                  <button
                    type="button"
                    onClick={() => handleUnpin(item.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      color: "var(--accent)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                    aria-label="Unpin this item"
                  >
                    unpin
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

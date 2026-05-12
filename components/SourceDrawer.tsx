"use client";

import { useEffect, useRef, useState } from "react";

export interface DrawerRequest {
  panelistSlug: string;
  postUrl: string;
  paragraphIndex: number;
}

interface DrawerPayload {
  author_slug: string;
  post_url: string;
  post_title: string;
  cited_paragraph_index: number;
  paragraphs: { index: number; text: string; is_cited: boolean }[];
}

export interface SourceDrawerProps {
  request: DrawerRequest | null;
  panelistName: string;
  onClose: () => void;
}

export function SourceDrawer({ request, panelistName, onClose }: SourceDrawerProps) {
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Track the focused element when the drawer opens so we can restore it on close.
  useEffect(() => {
    if (request) {
      lastTriggerRef.current = document.activeElement as HTMLElement | null;
    }
  }, [request]);

  // Fetch the source paragraphs when a new request comes in.
  useEffect(() => {
    if (!request) {
      setPayload(null);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    const url = `/api/sources/${encodeURIComponent(request.panelistSlug)}?url=${encodeURIComponent(
      request.postUrl,
    )}&p=${request.paragraphIndex}`;
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => ({}))) as {
            error?: { user_message?: string };
          };
          throw new Error(body.error?.user_message ?? `HTTP ${r.status}`);
        }
        return (await r.json()) as DrawerPayload;
      })
      .then((p) => setPayload(p))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => ctrl.abort();
  }, [request]);

  // Esc to close + focus trap.
  useEffect(() => {
    if (!request) return;
    const el = containerRef.current;
    el?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAndRestore();
      } else if (e.key === "Tab" && el) {
        const focusable = el.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  function closeAndRestore() {
    onClose();
    setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }

  if (!request) return null;

  return (
    <>
      <div
        onClick={closeAndRestore}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20, 20, 20, 0.15)",
          zIndex: 50,
        }}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Source paragraph"
        tabIndex={-1}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100vw)",
          background: "var(--bg)",
          borderLeft: "1px solid var(--hairline)",
          padding: "var(--space-3) var(--space-3)",
          overflowY: "auto",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <header
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
            }}
          >
            Source paragraph
          </span>
          <button type="button" onClick={closeAndRestore} aria-label="Close drawer">
            Close
          </button>
        </header>

        {error && (
          <div
            role="alert"
            style={{ color: "var(--muted)", fontFamily: "var(--font-sans)", fontSize: 14 }}
          >
            {error}
          </div>
        )}

        {payload && (
          <>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--type-scale-meta)",
                color: "var(--muted)",
                letterSpacing: "0.02em",
              }}
            >
              From {panelistName}, <em>{payload.post_title}</em>
            </div>

            <article
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              {payload.paragraphs.map((p) => (
                <p
                  key={p.index}
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--type-scale-body)",
                    lineHeight: 1.55,
                    color: "var(--text)",
                    borderBottom: p.is_cited ? "2px solid var(--accent)" : "none",
                    paddingBottom: p.is_cited ? 4 : 0,
                  }}
                >
                  {p.text}
                </p>
              ))}
            </article>

            <a
              href={payload.post_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--type-scale-meta)",
                marginTop: "var(--space-2)",
              }}
            >
              Read full essay on {new URL(payload.post_url).host} →
            </a>
          </>
        )}
      </div>
    </>
  );
}

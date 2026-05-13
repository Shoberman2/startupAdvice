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

/**
 * Best-effort font fidelity for each source site. The point is editorial
 * recognition, not pixel-perfect emulation: PG's site reads in Verdana,
 * essayists like Collison/Fried in serif, modern blogs in clean sans.
 */
function sourceFontFamily(panelistSlug: string): string {
  switch (panelistSlug) {
    case "paul-graham":
      return 'Verdana, Geneva, sans-serif';
    case "jason-fried":
    case "patrick-collison":
    case "sahil-lavingia":
      return 'Georgia, "Times New Roman", serif';
    case "naval":
    case "sam-altman":
    case "fred-wilson":
    case "garry-tan":
    default:
      return 'system-ui, -apple-system, "Helvetica Neue", Helvetica, sans-serif';
  }
}

export function SourceDrawer({ request, panelistName, onClose }: SourceDrawerProps) {
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (request) {
      lastTriggerRef.current = document.activeElement as HTMLElement | null;
    }
  }, [request]);

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
      .then(setPayload)
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => ctrl.abort();
  }, [request]);

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

  const sourceFont = sourceFontFamily(request.panelistSlug);
  const sourceHost = payload ? new URL(payload.post_url).host : "";
  const citedParagraph = payload?.paragraphs.find((p) => p.is_cited);

  return (
    <>
      <div
        onClick={closeAndRestore}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20, 20, 20, 0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 50,
          animation: "var(--duration-drawer) var(--ease) fade-in",
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
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(980px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 64px)",
          background: "var(--surface)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius-input)",
          padding: "var(--space-3) var(--space-4)",
          overflowY: "auto",
          zIndex: 51,
          boxShadow: "0 24px 64px -16px rgba(0, 0, 0, 0.35)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-2)",
            paddingBottom: "var(--space-2)",
            borderBottom: "1px solid var(--hairline)",
            marginBottom: "var(--space-3)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              letterSpacing: "0.02em",
            }}
          >
            {payload ? (
              <>
                From <span style={{ color: "var(--text)", fontWeight: 500 }}>{panelistName}</span>,{" "}
                <em style={{ color: "var(--text)" }}>{payload.post_title}</em>
                {sourceHost && <> · {sourceHost}</>}
              </>
            ) : (
              <span style={{ fontStyle: "italic" }}>Loading source…</span>
            )}
          </div>
          <button
            type="button"
            onClick={closeAndRestore}
            aria-label="Close drawer"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--hairline-strong)",
              padding: "4px 10px",
            }}
          >
            Esc
          </button>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              padding: "var(--space-3) 0",
            }}
          >
            {error}
          </div>
        )}

        {payload && citedParagraph && (
          <div className="spread">
            <div className="spread-page">
              <h4 className="spread-label">The cited paragraph</h4>
              <p
                className="spread-cited"
                style={{
                  fontFamily: sourceFont,
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: "var(--text)",
                  margin: 0,
                  paddingBottom: 4,
                  borderBottom: "2px solid var(--accent)",
                }}
              >
                {citedParagraph.text}
              </p>
            </div>

            <div className="spread-gutter" aria-hidden="true" />

            <div className="spread-page">
              <h4 className="spread-label">Surrounding context</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {payload.paragraphs.map((p) => (
                  <p
                    key={p.index}
                    style={{
                      margin: 0,
                      fontFamily: sourceFont,
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: p.is_cited ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {p.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {payload && (
          <footer
            style={{
              marginTop: "var(--space-3)",
              paddingTop: "var(--space-2)",
              borderTop: "1px solid var(--hairline)",
              textAlign: "center",
            }}
          >
            <a
              href={payload.post_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
              }}
            >
              Read the full essay on {sourceHost} →
            </a>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spread {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: var(--space-4);
        }
        .spread-gutter {
          background: var(--hairline-strong);
        }
        .spread-label {
          font-family: var(--font-sans);
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 var(--space-2);
          font-weight: 500;
        }
        @media (max-width: 760px) {
          .spread {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }
          .spread-gutter { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"], [aria-hidden="true"] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

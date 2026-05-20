"use client";

import { useEffect, useState } from "react";
import {
  isPinned as checkPinned,
  makePinId,
  pin,
  unpin,
  type PinnedItem,
} from "@/lib/pinned/storage";

export interface PinButtonProps {
  founderSlug: string;
  founderName: string;
  /** The user-asked question that prompted this answer. */
  questionText: string;
  /** The answer body being pinned. The pin id is derived from this + founderSlug. */
  answerText: string;
  /** Which surface this pin came from. */
  source: "/panel" | "/with";
  /** Optional deep link back to the conversation. */
  sourceUrl?: string;
}

/**
 * Inline typographic affordance to pin an AI answer to localStorage.
 *
 * Renders nothing on first server render (avoids SSR/CSR hydration mismatch,
 * since pinned state lives in the browser only).
 */
export function PinButton(props: PinButtonProps) {
  const id = makePinId(props.founderSlug, props.answerText);
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setPinned(checkPinned(id));
  }, [id]);

  if (!mounted) return null;

  function handleClick() {
    setError(null);
    if (pinned) {
      const ok = unpin(id);
      if (ok) setPinned(false);
      else setError("Couldn't unpin — storage failed.");
      return;
    }
    const item: PinnedItem = {
      id,
      founderSlug: props.founderSlug,
      founderName: props.founderName,
      questionText: props.questionText,
      answerText: props.answerText,
      source: props.source,
      pinnedAt: Date.now(),
      sourceUrl: props.sourceUrl,
    };
    const ok = pin(item);
    if (ok) setPinned(true);
    else setError("Couldn't pin — storage full or unavailable.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={pinned}
        aria-label={pinned ? "Unpin this answer" : "Pin this answer"}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: pinned ? "var(--muted)" : "var(--accent)",
          textDecoration: "none",
          alignSelf: "flex-start",
        }}
      >
        {pinned ? "· Pinned · click to unpin" : "+ Pin this"}
      </button>
      {error && (
        <span
          role="status"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

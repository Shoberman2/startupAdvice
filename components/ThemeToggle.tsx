"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "light";
    setTheme(current);
  }, []);

  function apply(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("fp-theme", next);
    } catch {
      /* private mode — skip persistence */
    }
    setTheme(next);
  }

  // Render an invisible placeholder server-side so layout doesn't shift.
  const current = theme ?? "light";

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: "inline-flex",
        border: "1px solid var(--hairline-strong)",
        borderRadius: "var(--radius-input)",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {(["light", "dark"] as const).map((mode) => {
        const active = current === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => apply(mode)}
            aria-pressed={active}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "5px 10px",
              border: 0,
              background: active ? "var(--text)" : "transparent",
              color: active ? "var(--bg)" : "var(--muted)",
              cursor: "pointer",
              borderRadius: 0,
            }}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}

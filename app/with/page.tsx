import Link from "next/link";
import { ALL_PANELISTS } from "@/lib/panel/all-panelists";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Research a founder — Founder Panel",
  description:
    "Pick a founder corpus and ask an AI research agent for source-backed notes.",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default function WithIndex() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "var(--space-3)",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <SiteHeader active="with" />

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-question)",
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
          }}
        >
          Pick a founder corpus to research
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
          Ask an AI agent to research public writing by that founder. It cites
          the sources it relies on.
        </p>
      </section>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {ALL_PANELISTS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/with/${p.slug}`}
              style={{
                textDecoration: "none",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) 0",
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-avatar)",
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {initials(p.name)}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--type-scale-body)",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  {p.era}
                </div>
              </div>
              <span
                aria-hidden="true"
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--accent)",
                }}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

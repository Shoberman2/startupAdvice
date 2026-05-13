import Link from "next/link";
import { ALL_PANELISTS } from "@/lib/panel/all-panelists";

export const metadata = {
  title: "Talk with a founder — Founder Panel",
  description: "Pick a founder and have a one-on-one conversation grounded in their essays.",
};

export default function WithIndex() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "var(--space-3)",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--accent)" }}
        >
          Founder Panel
        </Link>
        <nav
          style={{
            display: "flex",
            gap: "var(--space-3)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
          }}
        >
          <Link href="/think" style={{ color: "var(--muted)" }}>
            Think
          </Link>
          <Link href="/with" style={{ color: "var(--text)" }}>
            Talk
          </Link>
          <Link href="/" style={{ color: "var(--muted)" }}>
            Ask
          </Link>
        </nav>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-question)",
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          Pick a founder to talk with
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          One-on-one. In their voice. With citations on every claim.
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
                style={{
                  width: 56,
                  height: 56,
                  background: "var(--hairline)",
                  backgroundImage: `url(${p.avatarPath})`,
                  backgroundSize: "cover",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--type-scale-body)",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  {p.era}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

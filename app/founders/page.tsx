import Link from "next/link";
import { listFounders } from "@/lib/founders";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Founders — Founder Panel",
  description:
    "The twelve founders behind the panel. Who they are, what they shipped, and what they got wrong.",
};

export default async function FoundersIndex() {
  const founders = await listFounders();

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
      <SiteHeader active="founders" />

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
          The Panel · {founders.length} founders
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
          Founders
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
          The twelve voices behind the panel. Stories, wins, failures — in the order
          their essays land.
        </p>
      </section>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {founders.map((founder, idx) => (
          <li key={founder.slug}>
            <Link
              href={`/founders/${founder.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr auto 24px",
                gap: 12,
                alignItems: "baseline",
                padding: "var(--space-2) 0",
                borderBottom: "1px dotted var(--hairline)",
                textDecoration: "none",
                color: "var(--text)",
                fontFamily: "var(--font-serif)",
                fontSize: 18,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                {String(idx + 1).padStart(2, "0")}.
              </span>
              <span style={{ fontWeight: 500 }}>{founder.name}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {founder.era}
              </span>
              <span
                aria-hidden="true"
                style={{
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

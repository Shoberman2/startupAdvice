import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const CANONICAL_QUESTIONS = [
  "Should I raise venture capital now?",
  "When do I fire my cofounder?",
  "Should I quit my job to start something?",
  "Should I pivot?",
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-3)",
      }}
    >
      <SiteHeader active="ask" />

      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          gap: "var(--space-4)",
          padding: "var(--space-5) 0",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-question)",
            fontWeight: 500,
            textAlign: "center",
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
          }}
        >
          Twelve founders. Your question. With receipts.
        </h1>

        <form
          action="/panel"
          method="get"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <input
            type="text"
            name="q"
            placeholder="Ask something hard"
            aria-label="Your startup question"
            required
            maxLength={1000}
            style={{ width: "100%", padding: "var(--space-2) var(--space-3)" }}
          />
          <button type="submit" style={{ alignSelf: "flex-end" }}>
            Ask the panel →
          </button>
        </form>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
            width: "100%",
          }}
        >
          {CANONICAL_QUESTIONS.map((q) => (
            <li key={q}>
              <Link
                href={`/panel?q=${encodeURIComponent(q)}`}
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--text)",
                  textDecoration: "none",
                  fontSize: 17,
                }}
              >
                <span style={{ color: "var(--muted)", marginRight: 8 }}>·</span>
                {q}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

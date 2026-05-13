/**
 * Landing — pre-question state.
 *
 * Active-state rendering lives in app/panel/page.tsx; this file is the
 * editorial first-impression: wordmark, claim, input, four pinned questions.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-3)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--accent)",
          }}
        >
          Founder Panel
        </span>
        <nav
          style={{
            display: "flex",
            gap: "var(--space-3)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
          }}
        >
          <a href="/think" style={{ color: "var(--muted)" }}>
            Think
          </a>
          <a href="/with" style={{ color: "var(--muted)" }}>
            Talk
          </a>
          <a href="/watch" style={{ color: "var(--muted)" }}>
            Watch
          </a>
          <span style={{ color: "var(--text)" }}>Ask</span>
        </nav>
      </header>

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
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-question)",
            fontWeight: 400,
            textAlign: "center",
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          Eight founders. Your question. With receipts.
        </h1>

        <form
          action="/panel"
          method="get"
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
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
          {[
            "Should I raise venture capital now?",
            "When do I fire my cofounder?",
            "Should I quit my job to start something?",
            "Should I pivot?",
          ].map((q) => (
            <li key={q}>
              <a
                href={`/panel?q=${encodeURIComponent(q)}`}
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "var(--muted)", marginRight: 8 }}>·</span>
                {q}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

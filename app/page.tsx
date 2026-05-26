import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const CANONICAL_QUESTIONS = [
  "Should I raise venture capital now?",
  "When do I fire my cofounder?",
  "Should I quit my job to start something?",
  "Should I pivot?",
];

const inputStyle = {
  width: "100%",
  padding: "var(--space-2)",
} as const;

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--muted)",
} as const;

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
          justifyContent: "flex-start",
          maxWidth: 860,
          margin: "0 auto",
          width: "100%",
          gap: "var(--space-3)",
          padding: "var(--space-4) 0 var(--space-5)",
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
          An AI research agent for founder advice.
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 620,
            textAlign: "center",
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 20,
            lineHeight: 1.45,
          }}
        >
          It researches public founder writing and interviews, then gives
          source-backed advice with citations. It is not the founders themselves.
        </p>

        <div
          role="note"
          style={{
            width: "100%",
            borderTop: "1px solid var(--hairline)",
            borderBottom: "1px solid var(--hairline)",
            padding: "var(--space-2) 0",
            display: "grid",
            gridTemplateColumns: "minmax(120px, 0.24fr) 1fr",
            gap: "var(--space-2)",
          }}
        >
          <div className="smallcaps" style={{ color: "var(--accent)" }}>
            Disclosure
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              lineHeight: 1.45,
              color: "var(--muted)",
            }}
          >
            Founder Panel is an AI agent querying a public-source corpus. It
            summarizes what the sources support and shows receipts; it does not
            impersonate or contact the founders.
          </p>
        </div>

        <form
          action="/panel"
          method="get"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            paddingTop: "var(--space-2)",
          }}
        >
          <label style={labelStyle}>
            Question
            <input
              type="text"
              name="q"
              placeholder="Should I raise venture capital now?"
              aria-label="Your startup question"
              required
              maxLength={1000}
              style={{
                ...inputStyle,
                fontSize: 24,
              }}
            />
          </label>

          <fieldset
            style={{
              border: "1px solid var(--hairline-strong)",
              padding: "var(--space-3)",
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            <legend className="smallcaps" style={{ padding: "0 var(--space-1)" }}>
              Situation
            </legend>

            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              What are you building?
              <textarea
                name="company"
                placeholder="A marketplace for independent therapists, pre-launch"
                maxLength={280}
                rows={2}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Stage
              <select
                name="stage"
                defaultValue=""
                style={{
                  ...inputStyle,
                  border: "1px solid var(--hairline-strong)",
                  background: "var(--bg)",
                  borderRadius: "var(--radius-input)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                <option value="">Choose one</option>
                <option value="Idea / exploring">Idea / exploring</option>
                <option value="Building MVP">Building MVP</option>
                <option value="Launched, pre-revenue">Launched, pre-revenue</option>
                <option value="Early revenue">Early revenue</option>
                <option value="Growing revenue">Growing revenue</option>
                <option value="Scaling">Scaling</option>
              </select>
            </label>

            <label style={labelStyle}>
              Traction
              <input
                type="text"
                name="traction"
                placeholder="$8k MRR, 12% MoM growth"
                maxLength={180}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Runway
              <input
                type="text"
                name="runway"
                placeholder="9 months, two founders full-time"
                maxLength={120}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Goal
              <input
                type="text"
                name="goal"
                placeholder="Decide whether to raise before hiring"
                maxLength={180}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Constraint
              <input
                type="text"
                name="constraints"
                placeholder="Need profitability within a year"
                maxLength={180}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Advice lens
              <select
                name="lens"
                defaultValue="Balanced"
                style={{
                  ...inputStyle,
                  border: "1px solid var(--hairline-strong)",
                  background: "var(--bg)",
                  borderRadius: "var(--radius-input)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                <option value="Balanced">Balanced</option>
                <option value="VC-scale">VC-scale</option>
                <option value="Bootstrapped">Bootstrapped</option>
                <option value="Product taste">Product taste</option>
                <option value="Ruthless operator">Ruthless operator</option>
              </select>
            </label>
          </fieldset>

          <button type="submit" style={{ alignSelf: "flex-end" }}>
            Ask with context →
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

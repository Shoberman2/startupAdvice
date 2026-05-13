import Link from "next/link";
import { ALL_PANELISTS } from "@/lib/panel/all-panelists";
import { CATEGORY_LABELS, TOPICS, type TopicCategory } from "@/data/topics";
import { listAllSummaryStubs } from "@/lib/summaries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Think — Founder Panel",
  description: "How eight founders think about the questions that matter, in their own words.",
};

export default async function ThinkIndex() {
  const stubs = await listAllSummaryStubs();
  const exists = new Set(stubs.map((s) => `${s.founderSlug}|${s.topicSlug}`));

  const groupedTopics = groupByCategory();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "var(--space-3)",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--accent)",
          }}
        >
          Founder Panel
        </Link>
        <nav style={{ display: "flex", gap: "var(--space-3)" }}>
          <Link
            href="/think"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--text)",
            }}
          >
            Think
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
            }}
          >
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
          How eight founders think
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontSize: "var(--type-scale-body)",
            fontStyle: "italic",
          }}
        >
          Distilled positions from {TOPICS.length} topics, in their own words, with receipts.
        </p>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            margin: 0,
          }}
        >
          By founder
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "var(--space-2)",
          }}
        >
          {ALL_PANELISTS.map((p) => {
            const topicCount = TOPICS.filter((t) =>
              exists.has(`${p.slug}|${t.slug}`),
            ).length;
            return (
              <Link
                key={p.slug}
                href={`/think/${p.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) 0",
                  borderTop: "1px solid var(--hairline)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--hairline)",
                    backgroundImage: `url(${p.avatarPath})`,
                    backgroundSize: "cover",
                  }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "var(--type-scale-body)",
                      color: "var(--text)",
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
                    {topicCount} {topicCount === 1 ? "topic" : "topics"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            margin: 0,
          }}
        >
          By topic
        </h2>
        {(Object.keys(groupedTopics) as TopicCategory[]).map((cat) => (
          <section
            key={cat}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--type-scale-body)",
                fontStyle: "italic",
                color: "var(--text)",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {CATEGORY_LABELS[cat]}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {groupedTopics[cat].map((t) => {
                const count = ALL_PANELISTS.filter((p) =>
                  exists.has(`${p.slug}|${t.slug}`),
                ).length;
                return (
                  <li
                    key={t.slug}
                    style={{
                      borderTop: "1px solid var(--hairline)",
                      padding: "var(--space-1) 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "var(--space-2)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--type-scale-body)",
                      }}
                    >
                      {t.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {count}/{ALL_PANELISTS.length} founders
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>
    </main>
  );
}

function groupByCategory(): Record<TopicCategory, typeof TOPICS> {
  const out: Partial<Record<TopicCategory, typeof TOPICS>> = {};
  for (const t of TOPICS) {
    (out[t.category] ??= [] as unknown as typeof TOPICS);
    (out[t.category] as unknown as Array<typeof TOPICS[number]>).push(t);
  }
  return out as Record<TopicCategory, typeof TOPICS>;
}

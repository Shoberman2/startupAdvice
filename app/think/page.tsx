import Link from "next/link";
import { ALL_PANELISTS } from "@/lib/panel/all-panelists";
import { CATEGORY_LABELS, TOPICS, type TopicCategory } from "@/data/topics";
import { listAllSummaryStubs } from "@/lib/summaries";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Think — Founder Panel",
  description: "How twelve founders think about the questions that matter, in their own words.",
};

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi"];
const PART_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default async function ThinkIndex() {
  const stubs = await listAllSummaryStubs();
  const exists = new Set(stubs.map((s) => `${s.founderSlug}|${s.topicSlug}`));

  // Founders with at least one summary, in declared order.
  const foundersWithSummaries = ALL_PANELISTS.filter((p) =>
    TOPICS.some((t) => exists.has(`${p.slug}|${t.slug}`)),
  );

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
      <SiteHeader active="think" />

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
          Think
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
          Topical summaries across the eight-blog corpus. Read what each founder has said
          about the topics that matter to you.
        </p>
      </section>

      {foundersWithSummaries.length === 0 && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--muted)",
            padding: "var(--space-4) 0",
            margin: 0,
          }}
        >
          No summaries generated yet. Run{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
            bun run generate-summaries
          </code>{" "}
          to populate the library.
        </p>
      )}

      {foundersWithSummaries.map((p, partIdx) => {
        const topicsForFounder = TOPICS.filter((t) => exists.has(`${p.slug}|${t.slug}`));
        return (
          <section key={p.slug} style={{ marginTop: "var(--space-3)" }}>
            <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
              Part {PART_ROMAN[partIdx] ?? partIdx + 1}
            </div>
            <h2
              style={{
                margin: "0 0 var(--space-2)",
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              <Link href={`/think/${p.slug}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                {p.name}
              </Link>
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {topicsForFounder.map((t, ti) => (
                <li key={t.slug}>
                  <Link
                    href={`/think/${p.slug}/${t.slug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr auto auto",
                      gap: 12,
                      alignItems: "baseline",
                      padding: "10px 0",
                      borderBottom: "1px dotted var(--hairline)",
                      textDecoration: "none",
                      color: "var(--text)",
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {ROMAN[ti] ?? ti + 1}.
                    </span>
                    <span>
                      {t.label}
                      {t.description && (
                        <em
                          style={{
                            color: "var(--muted)",
                            fontStyle: "italic",
                            fontSize: 14,
                            marginLeft: 8,
                          }}
                        >
                          — {t.description}
                        </em>
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      summary
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
          </section>
        );
      })}

      <ByTopicIndex stubs={stubs} />
    </main>
  );
}

function ByTopicIndex({ stubs }: { stubs: Array<{ founderSlug: string; topicSlug: string }> }) {
  const exists = new Set(stubs.map((s) => `${s.founderSlug}|${s.topicSlug}`));
  const groupedTopics = groupByCategory();
  const categories = Object.keys(groupedTopics) as TopicCategory[];

  if (categories.length === 0) return null;

  return (
    <section
      style={{
        marginTop: "var(--space-5)",
        paddingTop: "var(--space-3)",
        borderTop: "2px solid var(--text)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <div>
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
          Index
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          By topic
        </h2>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h3
            style={{
              margin: "0 0 var(--space-1)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              fontWeight: 400,
              color: "var(--text)",
            }}
          >
            {CATEGORY_LABELS[cat]}
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {groupedTopics[cat].map((t) => {
              const count = ALL_PANELISTS.filter((p) => exists.has(`${p.slug}|${t.slug}`)).length;
              return (
                <li
                  key={t.slug}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px dotted var(--hairline)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "var(--space-2)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
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
        </div>
      ))}
    </section>
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

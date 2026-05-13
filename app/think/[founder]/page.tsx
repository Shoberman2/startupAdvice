import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta, ALL_PANELISTS } from "@/lib/panel/all-panelists";
import { CATEGORY_LABELS, TOPICS, topicBySlug, type TopicCategory } from "@/data/topics";
import { listSummariesByFounder } from "@/lib/summaries";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

interface Params {
  founder: string;
}

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi"];

export async function generateStaticParams() {
  return ALL_PANELISTS.map((p) => ({ founder: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { founder } = await params;
  try {
    const meta = panelistMeta(founder);
    return {
      title: `${meta.name} — Founder Panel`,
      description: `How ${meta.name} thinks about the questions that matter, in his own words.`,
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function FounderPage({ params }: { params: Promise<Params> }) {
  const { founder } = await params;
  let meta;
  try {
    meta = panelistMeta(founder);
  } catch {
    notFound();
  }

  const summaries = await listSummariesByFounder(founder);
  const bySlug = new Map(summaries.map((s) => [s.topicSlug, s]));

  const groupedTopics: Partial<Record<TopicCategory, typeof TOPICS>> = {};
  for (const t of TOPICS) {
    (groupedTopics[t.category] ??= [] as unknown as typeof TOPICS);
    (groupedTopics[t.category] as unknown as Array<typeof TOPICS[number]>).push(t);
  }

  // Flatten in category order — gives stable Roman numerals across the page.
  const visibleTopics: Array<{ category: TopicCategory; topic: typeof TOPICS[number] }> = [];
  for (const cat of Object.keys(groupedTopics) as TopicCategory[]) {
    for (const t of groupedTopics[cat] ?? []) {
      if (bySlug.has(t.slug)) visibleTopics.push({ category: cat, topic: t });
    }
  }

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
      <SiteHeader
        active="think"
        rightSlot={
          <Link
            href="/think"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← All founders
          </Link>
        }
      />

      <section
        style={{
          paddingBottom: "var(--space-2)",
          borderBottom: "2px solid var(--text)",
          marginTop: "var(--space-3)",
        }}
      >
        <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
          By founder
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
          {meta.name}
        </h1>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 6,
          }}
        >
          {meta.era}
        </div>
        <a
          href={meta.blogUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            marginTop: 8,
            display: "inline-block",
          }}
        >
          {new URL(meta.blogUrl).host} →
        </a>
      </section>

      {visibleTopics.length === 0 && (
        <p
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            margin: 0,
            padding: "var(--space-3) 0",
          }}
        >
          No summaries generated yet. Run{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
            bun run generate-summaries --only {meta.slug}
          </code>{" "}
          to populate this part.
        </p>
      )}

      {visibleTopics.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {visibleTopics.map(({ topic }, i) => {
            const t = topicBySlug(topic.slug);
            return (
              <li key={topic.slug}>
                <Link
                  href={`/think/${meta.slug}/${topic.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto",
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
                    {ROMAN[i] ?? i + 1}.
                  </span>
                  <span>
                    <span style={{ fontWeight: 500 }}>{topic.label}</span>
                    {t?.description && (
                      <em
                        style={{
                          color: "var(--muted)",
                          fontStyle: "italic",
                          fontSize: 15,
                          display: "block",
                          marginTop: 3,
                        }}
                      >
                        {t.description}
                      </em>
                    )}
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
            );
          })}
        </ul>
      )}

      {/* Group lookup by category in a small back-of-book index */}
      {visibleTopics.length > 0 && (
        <section
          style={{
            marginTop: "var(--space-4)",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid var(--hairline)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {(Object.keys(groupedTopics) as TopicCategory[])
            .filter((cat) => (groupedTopics[cat] ?? []).some((t) => bySlug.has(t.slug)))
            .map((cat, idx, arr) => (
              <span key={cat}>
                {CATEGORY_LABELS[cat]}: {(groupedTopics[cat] ?? []).filter((t) => bySlug.has(t.slug)).length}
                {idx < arr.length - 1 && <span style={{ margin: "0 8px" }}>·</span>}
              </span>
            ))}
        </section>
      )}
    </main>
  );
}

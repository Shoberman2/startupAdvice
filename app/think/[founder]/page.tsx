import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta, ALL_PANELISTS } from "@/lib/panel/all-panelists";
import { CATEGORY_LABELS, TOPICS, topicBySlug, type TopicCategory } from "@/data/topics";
import { listSummariesByFounder } from "@/lib/summaries";

export const dynamic = "force-dynamic";

interface Params {
  founder: string;
}

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

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "var(--space-3)",
        maxWidth: 900,
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
        <Link
          href="/think"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
            color: "var(--muted)",
          }}
        >
          All founders →
        </Link>
      </header>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--hairline)",
          paddingBottom: "var(--space-3)",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            background: "var(--hairline)",
            backgroundImage: `url(${meta.avatarPath})`,
            backgroundSize: "cover",
          }}
          aria-hidden="true"
        />
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "var(--type-scale-question)",
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            {meta.name}
          </h1>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              marginTop: 4,
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
              fontSize: "var(--type-scale-meta)",
              marginTop: 8,
              display: "inline-block",
            }}
          >
            {new URL(meta.blogUrl).host} →
          </a>
        </div>
      </section>

      {summaries.length === 0 && (
        <div
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          No summaries generated yet. Run{" "}
          <code style={{ fontFamily: "var(--font-mono)" }}>
            bun run generate-summaries --only {meta.slug}
          </code>{" "}
          to populate this library.
        </div>
      )}

      {(Object.keys(groupedTopics) as TopicCategory[]).map((cat) => {
        const topicsInCat = groupedTopics[cat] ?? [];
        const visibleTopics = topicsInCat.filter((t) => bySlug.has(t.slug));
        if (visibleTopics.length === 0) return null;
        return (
          <section
            key={cat}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
          >
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
              {CATEGORY_LABELS[cat]}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {visibleTopics.map((t) => {
                const topic = topicBySlug(t.slug);
                return (
                  <li
                    key={t.slug}
                    style={{
                      borderTop: "1px solid var(--hairline)",
                      padding: "var(--space-2) 0",
                    }}
                  >
                    <Link
                      href={`/think/${meta.slug}/${t.slug}`}
                      style={{
                        textDecoration: "none",
                        color: "var(--text)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
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
                          fontFamily: "var(--font-serif)",
                          fontSize: 14,
                          color: "var(--muted)",
                          fontStyle: "italic",
                        }}
                      >
                        {topic?.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}

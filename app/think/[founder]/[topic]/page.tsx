import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { topicBySlug } from "@/data/topics";
import { getSummary, listSummariesByTopic } from "@/lib/summaries";
import { SummaryView } from "./SummaryView";

export const dynamic = "force-dynamic";

interface Params {
  founder: string;
  topic: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { founder, topic } = await params;
  try {
    const meta = panelistMeta(founder);
    const t = topicBySlug(topic);
    if (!t) return { title: "Not found" };
    return {
      title: `${meta.name} on ${t.label} — Founder Panel`,
      description: t.description,
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function TopicSummaryPage({ params }: { params: Promise<Params> }) {
  const { founder, topic } = await params;
  let meta;
  try {
    meta = panelistMeta(founder);
  } catch {
    notFound();
  }
  const topicMeta = topicBySlug(topic);
  if (!topicMeta) notFound();

  const summary = await getSummary(founder, topic);
  const otherFoundersOnTopic = (await listSummariesByTopic(topic)).filter(
    (s) => s.founderSlug !== founder,
  );

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
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--accent)",
          }}
        >
          Founder Panel
        </Link>
        <nav
          style={{
            display: "flex",
            gap: "var(--space-2)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
          }}
        >
          <Link href="/think" style={{ color: "var(--muted)" }}>
            Think
          </Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>
            /
          </span>
          <Link href={`/think/${meta.slug}`} style={{ color: "var(--muted)" }}>
            {meta.name}
          </Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>
            /
          </span>
          <span style={{ color: "var(--text)" }}>{topicMeta.label}</span>
        </nav>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
            color: "var(--muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {meta.name} on
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 40,
            fontWeight: 400,
            lineHeight: 1.15,
          }}
        >
          {topicMeta.label}
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "var(--type-scale-body)",
          }}
        >
          {topicMeta.description}
        </p>
      </section>

      <hr />

      {summary ? (
        <SummaryView summary={summary} panelistSlug={meta.slug} panelistName={meta.name} />
      ) : (
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--muted)",
          }}
        >
          {meta.name} hasn&apos;t been summarized on this topic yet.
        </div>
      )}

      {otherFoundersOnTopic.length > 0 && (
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            borderTop: "1px solid var(--hairline)",
            paddingTop: "var(--space-3)",
          }}
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
            Other voices on {topicMeta.label.toLowerCase()}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {otherFoundersOnTopic.map((s) => {
              const otherMeta = panelistMeta(s.founderSlug);
              return (
                <li
                  key={s.founderSlug}
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    padding: "var(--space-2) 0",
                  }}
                >
                  <Link
                    href={`/think/${s.founderSlug}/${topic}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "var(--hairline)",
                        backgroundImage: `url(${otherMeta.avatarPath})`,
                        backgroundSize: "cover",
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--type-scale-body)",
                      }}
                    >
                      {otherMeta.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

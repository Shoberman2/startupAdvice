import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { topicBySlug } from "@/data/topics";
import { getSummary, listSummariesByTopic } from "@/lib/summaries";
import { SiteHeader } from "@/components/SiteHeader";
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
        minHeight: "100dvh",
        padding: "var(--space-3)",
        maxWidth: 720,
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
            href={`/think/${meta.slug}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← {meta.name}
          </Link>
        }
      />

      <section
        style={{
          paddingTop: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <div className="smallcaps" style={{ color: "var(--muted)", letterSpacing: "0.22em" }}>
          <Link
            href={`/think/${meta.slug}`}
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            {meta.name}
          </Link>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 38,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {topicMeta.label}
        </h1>
        <p
          style={{
            margin: 0,
            paddingBottom: "var(--space-2)",
            borderBottom: "1px solid var(--hairline)",
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 21,
            lineHeight: 1.5,
          }}
        >
          {topicMeta.description}
        </p>
      </section>

      {summary ? (
        <SummaryView summary={summary} panelistSlug={meta.slug} panelistName={meta.name} />
      ) : (
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--muted)",
            padding: "var(--space-3) 0",
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
            marginTop: "var(--space-4)",
          }}
        >
          <h2 className="smallcaps" style={{ margin: 0 }}>
            Other voices on {topicMeta.label.toLowerCase()}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {otherFoundersOnTopic.map((s) => {
              const otherMeta = panelistMeta(s.founderSlug);
              return (
                <li key={s.founderSlug}>
                  <Link
                    href={`/think/${s.founderSlug}/${topic}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      padding: "var(--space-2) 0",
                      borderBottom: "1px dotted var(--hairline)",
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                    }}
                  >
                    <span>{otherMeta.name}</span>
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
        </section>
      )}
    </main>
  );
}

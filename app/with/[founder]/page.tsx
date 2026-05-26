import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { SiteHeader } from "@/components/SiteHeader";
import { ChatView } from "./ChatView";

interface Params {
  founder: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { founder } = await params;
  try {
    const meta = panelistMeta(founder);
    return {
      title: `Research ${meta.name} — Founder Panel`,
      description: `An AI research agent grounded in public sources by ${meta.name}.`,
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function WithFounderPage({ params }: { params: Promise<Params> }) {
  const { founder } = await params;
  let meta;
  try {
    meta = panelistMeta(founder);
  } catch {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 720,
        margin: "0 auto",
        padding: "var(--space-3) var(--space-3) 0",
      }}
    >
      <SiteHeader
        active="with"
        rightSlot={
          <Link
            href="/with"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            Talk to someone else →
          </Link>
        }
      />

      <section
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
          padding: "var(--space-3) 0 var(--space-2)",
          marginTop: "var(--space-2)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-avatar)",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          {initials(meta.name)}
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 24,
              fontWeight: 500,
              color: "var(--text)",
              lineHeight: 1.1,
            }}
          >
            {meta.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            {meta.era}
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              color: "var(--muted)",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            AI research view based on public sources. Not a live conversation
            with {meta.name}.
          </p>
        </div>
      </section>

      <ChatView
        founderSlug={meta.slug}
        founderName={meta.name}
        founderFirstName={firstName(meta.name)}
      />
    </main>
  );
}

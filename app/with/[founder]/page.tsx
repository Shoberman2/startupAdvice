import Link from "next/link";
import { notFound } from "next/navigation";
import { panelistMeta } from "@/lib/panel/all-panelists";
import { ChatView } from "./ChatView";

interface Params {
  founder: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { founder } = await params;
  try {
    const meta = panelistMeta(founder);
    return {
      title: `Talk with ${meta.name} — Founder Panel`,
      description: `A one-on-one conversation with the ${meta.name} AI, grounded in his essays.`,
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 720,
        margin: "0 auto",
        padding: "var(--space-3) var(--space-3) 0",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "var(--space-2)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <Link
          href="/"
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--accent)" }}
        >
          Founder Panel
        </Link>
        <Link
          href="/with"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
            color: "var(--muted)",
          }}
        >
          Talk to someone else →
        </Link>
      </header>

      <section
        style={{
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
          padding: "var(--space-2) 0",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: "var(--hairline)",
            backgroundImage: `url(${meta.avatarPath})`,
            backgroundSize: "cover",
            flexShrink: 0,
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
            {meta.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            {meta.era}
          </div>
        </div>
      </section>

      <ChatView founderSlug={meta.slug} founderName={meta.name} />
    </main>
  );
}

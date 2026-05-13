import Link from "next/link";
import { DebateView } from "./DebateView";

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return {
    title: "Debate — Founder Panel",
    description: `Read the founder debate at /watch/${id}.`,
  };
}

export default async function DebatePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "var(--space-3)",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--accent)" }}
        >
          Founder Panel
        </Link>
        <Link
          href="/watch"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
            color: "var(--muted)",
          }}
        >
          All debates →
        </Link>
      </header>

      <DebateView debateId={id} />
    </main>
  );
}

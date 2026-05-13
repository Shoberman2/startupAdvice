import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
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
        active="watch"
        rightSlot={
          <Link
            href="/watch"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Back to Watch
          </Link>
        }
      />

      <DebateView debateId={id} />
    </main>
  );
}

import Link from "next/link";
import { WatchFeed } from "./WatchFeed";

export const metadata = {
  title: "Watch — Founder Panel",
  description: "Watch founders debate each other in real time.",
};

export default function WatchPage() {
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
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--accent)" }}
        >
          Founder Panel
        </Link>
        <nav
          style={{
            display: "flex",
            gap: "var(--space-3)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--type-scale-meta)",
          }}
        >
          <Link href="/think" style={{ color: "var(--muted)" }}>
            Think
          </Link>
          <Link href="/with" style={{ color: "var(--muted)" }}>
            Talk
          </Link>
          <Link href="/watch" style={{ color: "var(--text)" }}>
            Watch
          </Link>
          <Link href="/" style={{ color: "var(--muted)" }}>
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
          Watch them argue
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          A new turn lands every fifteen minutes. Drop in on whatever's happening.
        </p>
      </section>

      <WatchFeed />
    </main>
  );
}

import { SiteHeader } from "@/components/SiteHeader";
import { WatchFeed } from "./WatchFeed";

export const metadata = {
  title: "Watch — Founder Panel",
  description: "Watch founders debate each other in real time.",
};

function formattedToday(): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return fmt.format(new Date());
}

export default function WatchPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "var(--space-3)",
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <SiteHeader active="watch" />

      <section
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-2)",
          borderBottom: "2px solid var(--text)",
          marginTop: "var(--space-3)",
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
          Watch
        </h1>
        <div className="mono-meta">{formattedToday()}</div>
      </section>

      <WatchFeed />
    </main>
  );
}

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Off the page — Founder Panel",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-3)",
      }}
    >
      <SiteHeader />

      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "var(--space-2)",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: 64,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          Off the page.
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--muted)",
            fontSize: 19,
            maxWidth: 420,
          }}
        >
          That URL isn&apos;t something the corpus knows about. The good essays are still
          where you left them.
        </p>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            marginTop: "var(--space-2)",
          }}
        >
          ← Back to Founder Panel
        </Link>
      </section>
    </main>
  );
}

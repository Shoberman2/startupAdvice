import Link from "next/link";
import { notFound } from "next/navigation";
import { getFounder, listFounderSlugs, type Founder } from "@/lib/founders";
import { SiteHeader } from "@/components/SiteHeader";
import { FounderAvatar } from "@/components/FounderAvatar";
import { queryWithTimeout } from "@/lib/db/client";

export const dynamic = "force-dynamic";

interface Params {
  slug: string;
}

interface NotableEssayRow {
  post_url: string;
  post_title: string;
  post_published: Date | null;
  chunk_count: string;
}

export async function generateStaticParams() {
  return listFounderSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  try {
    const founder = await getFounder(slug);
    return {
      title: `${founder.name} — Founder Panel`,
      description: founder.profile.why_listen,
    };
  } catch {
    return { title: "Not found — Founder Panel" };
  }
}

async function loadNotableEssays(slug: string): Promise<NotableEssayRow[]> {
  // Top 6 essays by chunk count. Hard 2s cap so the page never blocks on
  // a slow or unreachable database. Returns empty silently on any failure.
  const NOTABLE_ESSAYS_TIMEOUT_MS = 2000;
  try {
    return await queryWithTimeout<NotableEssayRow>(
      `SELECT post_url, post_title, post_published, COUNT(*)::text AS chunk_count
         FROM chunks
        WHERE author_slug = $1
        GROUP BY post_url, post_title, post_published
        ORDER BY COUNT(*) DESC, post_published DESC NULLS LAST
        LIMIT 6`,
      [slug],
      NOTABLE_ESSAYS_TIMEOUT_MS,
    );
  } catch {
    return [];
  }
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export default async function FounderProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let founder: Founder;
  try {
    founder = await getFounder(slug);
  } catch {
    notFound();
  }

  // Directory-only founders have no chunks; skip the DB roundtrip entirely.
  const essays = founder.directoryOnly ? [] : await loadNotableEssays(founder.slug);
  const blogHost = (() => {
    try {
      return new URL(founder.blogUrl).host;
    } catch {
      return founder.blogUrl;
    }
  })();

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
        active="founders"
        rightSlot={
          <Link
            href="/founders"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--type-scale-meta)",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← All founders
          </Link>
        }
      />

      {/* Letterhead */}
      <section
        style={{
          paddingBottom: "var(--space-2)",
          borderBottom: "2px solid var(--text)",
          marginTop: "var(--space-3)",
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-3)",
        }}
      >
        <FounderAvatar slug={founder.slug} name={founder.name} size={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="smallcaps" style={{ color: "var(--accent)", marginBottom: 4 }}>
            The Panel · Profile
          </div>
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
            {founder.name}
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            {founder.era}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 4,
              letterSpacing: "0.02em",
            }}
          >
            Source: {founder.profile.primary_source}
          </div>
          <a
            href={founder.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              marginTop: 8,
              display: "inline-block",
            }}
          >
            {blogHost} →
          </a>
        </div>
      </section>

      {/* Bio — chapter body */}
      <section>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 19,
            lineHeight: 1.65,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {founder.profile.bio}
        </p>
      </section>

      {/* Notable stories */}
      <ProfileSection title="Notable stories">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
        >
          {founder.profile.notable_stories.map((story) => (
            <article key={story.title}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  letterSpacing: "-0.005em",
                  margin: "0 0 var(--space-1)",
                  color: "var(--text)",
                }}
              >
                {story.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {story.body}
              </p>
            </article>
          ))}
        </div>
      </ProfileSection>

      {/* Advice */}
      <ProfileSection title="Advice">
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {founder.profile.advice.map((item) => (
            <li
              key={item.headline}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--text)",
                paddingLeft: "var(--space-2)",
                borderLeft: "2px solid var(--hairline-strong)",
              }}
            >
              <strong style={{ fontWeight: 600, color: "var(--text)" }}>
                {item.headline}
              </strong>
              <span style={{ color: "var(--muted)" }}> — {item.elaboration}</span>
            </li>
          ))}
        </ul>
      </ProfileSection>

      {/* Why listen */}
      <ProfileSection title="Why listen">
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.55,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {founder.profile.why_listen}
        </p>
      </ProfileSection>

      {/* Notable essays — silently omitted if directory-only or the corpus isn't loaded */}
      {essays.length > 0 && (
        <ProfileSection title="Notable essays">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {essays.map((essay) => (
              <li key={essay.post_url}>
                <a
                  href={essay.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "baseline",
                    padding: "8px 0",
                    borderBottom: "1px dotted var(--hairline)",
                    textDecoration: "none",
                    color: "var(--text)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                  }}
                >
                  <span>{essay.post_title}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {formatYear(essay.post_published)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* CTA pair — hidden for directory-only founders (no chat / no summaries) */}
      {!founder.directoryOnly && (
        <section
          style={{
            marginTop: "var(--space-3)",
            paddingTop: "var(--space-3)",
            borderTop: "2px solid var(--text)",
            display: "flex",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            fontFamily: "var(--font-serif)",
            fontSize: 18,
          }}
        >
          <Link
            href={`/with/${founder.slug}`}
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Chat with {firstName(founder.name)} →
          </Link>
          <Link
            href={`/think/${founder.slug}`}
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Read {firstName(founder.name)}&apos;s summaries →
          </Link>
        </section>
      )}

      {/* Directory-only footer note */}
      {founder.directoryOnly && (
        <section
          style={{
            marginTop: "var(--space-3)",
            paddingTop: "var(--space-3)",
            borderTop: "2px solid var(--text)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--muted)",
          }}
        >
          Directory entry. {firstName(founder.name)} isn&apos;t available for chat —
          their advice lives in {founder.profile.primary_source}.
        </section>
      )}
    </main>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="smallcaps"
      style={{
        color: "var(--accent)",
        marginBottom: "var(--space-2)",
      }}
    >
      {children}
    </div>
  );
}

function formatYear(published: Date | string | null): string {
  if (!published) return "";
  const d = published instanceof Date ? published : new Date(published);
  if (Number.isNaN(d.getTime())) return "";
  return String(d.getUTCFullYear());
}

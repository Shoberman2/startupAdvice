import Link from "next/link";
import { notFound } from "next/navigation";
import { getFounder, listFounderSlugs, type Founder } from "@/lib/founders";
import { SiteHeader } from "@/components/SiteHeader";
import { query } from "@/lib/db/client";

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
  // Top 6 essays by chunk count (longer essays are usually the canonical ones).
  // Returns empty on any failure — corpus may not be scraped in every env.
  try {
    return await query<NotableEssayRow>(
      `SELECT post_url, post_title, post_published, COUNT(*)::text AS chunk_count
         FROM chunks
        WHERE author_slug = $1
        GROUP BY post_url, post_title, post_published
        ORDER BY COUNT(*) DESC, post_published DESC NULLS LAST
        LIMIT 6`,
      [slug],
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

  const essays = await loadNotableEssays(founder.slug);
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
        }}
      >
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

      {/* Signature ideas */}
      <ProfileSection title="Signature ideas">
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {founder.profile.signature_ideas.map((idea) => (
            <li
              key={idea}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                color: "var(--text)",
                display: "flex",
                gap: 10,
              }}
            >
              <span style={{ color: "var(--muted)" }}>·</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </ProfileSection>

      {/* Wins + failures */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <SectionLabel>Notable wins</SectionLabel>
          <WinList items={founder.profile.notable_wins} />
        </div>
        <div>
          <SectionLabel>Notable failures</SectionLabel>
          <WinList items={founder.profile.notable_failures} />
        </div>
      </section>

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

      {/* Notable essays — silently omitted if the corpus isn't loaded for this author */}
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

      {/* CTA pair */}
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
          Read {firstName(founder.name)}'s summaries →
        </Link>
      </section>
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
        marginBottom: "var(--space-1)",
      }}
    >
      {children}
    </div>
  );
}

function WinList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {items.map((item) => (
        <li
          key={item}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--text)",
            lineHeight: 1.45,
          }}
        >
          <span style={{ color: "var(--muted)", marginRight: 8 }}>·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function formatYear(published: Date | string | null): string {
  if (!published) return "";
  const d = published instanceof Date ? published : new Date(published);
  if (Number.isNaN(d.getTime())) return "";
  return String(d.getUTCFullYear());
}

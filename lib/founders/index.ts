import { listPersonas, getPersona, type Persona } from "@/lib/personas";
import { FOUNDERS_BY_SLUG, ALL_PROFILES, type FounderProfile } from "./profiles";

export type { FounderProfile } from "./profiles";

export interface Founder {
  slug: string;
  /** Display name from personas/*.md frontmatter. */
  name: string;
  /** Era string from personas/*.md frontmatter (e.g. "Y Combinator, 2005–present"). */
  era: string;
  /** Personal blog URL from personas/*.md frontmatter. */
  blogUrl: string;
  /** Hand-curated short company/role line (from profiles.ts). */
  company: string;
  /** Hand-curated content (from profiles.ts). */
  profile: FounderProfile;
}

function join(persona: Persona, profile: FounderProfile): Founder {
  return {
    slug: persona.slug,
    name: persona.name,
    era: persona.era,
    blogUrl: persona.blogUrl,
    company: profile.company,
    profile,
  };
}

/**
 * Return every founder in the corpus, joining persona frontmatter with the
 * hand-curated profile content. Throws on drift between the two sources.
 *
 * Ordering: matches the order in `ALL_PROFILES` so the index page reflects
 * a deliberate editorial ordering rather than alphabetical.
 */
export async function listFounders(): Promise<Founder[]> {
  const personas = await listPersonas();
  const personaBySlug = new Map(personas.map((p) => [p.slug, p]));

  // Cross-check: every persona must have a profile and vice versa.
  // This is the build-time assertion that catches corpus drift.
  for (const persona of personas) {
    if (!FOUNDERS_BY_SLUG.has(persona.slug)) {
      throw new Error(
        `Founder drift: persona '${persona.slug}' has no profile in lib/founders/profiles.ts`,
      );
    }
  }
  for (const profile of ALL_PROFILES) {
    if (!personaBySlug.has(profile.slug)) {
      throw new Error(
        `Founder drift: profile '${profile.slug}' has no persona in personas/${profile.slug}.md`,
      );
    }
  }

  return ALL_PROFILES.map((profile) => {
    const persona = personaBySlug.get(profile.slug);
    if (!persona) throw new Error(`unreachable: persona ${profile.slug} missing`);
    return join(persona, profile);
  });
}

export async function getFounder(slug: string): Promise<Founder> {
  const profile = FOUNDERS_BY_SLUG.get(slug);
  if (!profile) {
    throw new Error(`Unknown founder slug: ${slug}`);
  }
  const persona = await getPersona(slug);
  return join(persona, profile);
}

export function listFounderSlugs(): string[] {
  return ALL_PROFILES.map((p) => p.slug);
}

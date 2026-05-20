import { listPersonas, getPersona, type Persona } from "@/lib/personas";
import {
  FOUNDERS_BY_SLUG,
  ALL_PROFILES,
  isDirectoryOnly,
  type FounderProfile,
} from "./profiles";

export type {
  FounderProfile,
  FounderStory,
  FounderAdvice,
} from "./profiles";

export { isDirectoryOnly } from "./profiles";

export interface Founder {
  slug: string;
  /** Display name. From personas/*.md frontmatter for chat-able founders;
   *  inline in profile for directory-only founders. */
  name: string;
  era: string;
  blogUrl: string;
  company: string;
  /** True if this founder has no persona file (book-author etc.).
   *  /panel selection excludes them; /with chat must refuse politely. */
  directoryOnly: boolean;
  profile: FounderProfile;
}

function joinWithPersona(persona: Persona, profile: FounderProfile): Founder {
  return {
    slug: persona.slug,
    name: persona.name,
    era: persona.era,
    blogUrl: persona.blogUrl,
    company: profile.company,
    directoryOnly: false,
    profile,
  };
}

function joinDirectoryOnly(profile: FounderProfile): Founder {
  if (!isDirectoryOnly(profile)) {
    throw new Error(
      `joinDirectoryOnly called on a persona-backed profile: ${profile.slug}`,
    );
  }
  return {
    slug: profile.slug,
    name: profile.name,
    era: profile.era,
    blogUrl: profile.blog_url,
    company: profile.company,
    directoryOnly: true,
    profile,
  };
}

/**
 * Return every founder in the directory, joining persona frontmatter with
 * the hand-curated profile content for chat-able founders, and using the
 * inline name/era/blog_url fields for directory-only founders.
 *
 * Throws on drift between personas/ and profiles.ts:
 *   - Every persona on disk MUST have a profile.
 *   - Every profile that isn't directory_only MUST have a persona.
 */
export async function listFounders(): Promise<Founder[]> {
  const personas = await listPersonas();
  const personaBySlug = new Map(personas.map((p) => [p.slug, p]));

  for (const persona of personas) {
    if (!FOUNDERS_BY_SLUG.has(persona.slug)) {
      throw new Error(
        `Founder drift: persona '${persona.slug}' has no profile in lib/founders/profiles.ts`,
      );
    }
  }
  for (const profile of ALL_PROFILES) {
    if (!isDirectoryOnly(profile) && !personaBySlug.has(profile.slug)) {
      throw new Error(
        `Founder drift: profile '${profile.slug}' has no persona in personas/${profile.slug}.md (and isn't marked directory_only)`,
      );
    }
  }

  return ALL_PROFILES.map((profile) => {
    if (isDirectoryOnly(profile)) {
      return joinDirectoryOnly(profile);
    }
    const persona = personaBySlug.get(profile.slug);
    if (!persona) {
      throw new Error(`unreachable: persona ${profile.slug} missing`);
    }
    return joinWithPersona(persona, profile);
  });
}

export async function getFounder(slug: string): Promise<Founder> {
  const profile = FOUNDERS_BY_SLUG.get(slug);
  if (!profile) {
    throw new Error(`Unknown founder slug: ${slug}`);
  }
  if (isDirectoryOnly(profile)) {
    return joinDirectoryOnly(profile);
  }
  const persona = await getPersona(slug);
  return joinWithPersona(persona, profile);
}

export function listFounderSlugs(): string[] {
  return ALL_PROFILES.map((p) => p.slug);
}

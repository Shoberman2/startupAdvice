import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { FOUNDER_SOURCE_BY_SLUG } from "@/data/founder-sources";

export type PersonaTier = "A" | "B";

export interface Persona {
  slug: string;
  name: string;
  era: string;
  blogUrl: string;
  headshotPath: string;
  tier: PersonaTier;
  systemPrompt: string;
}

interface PersonaFrontmatter {
  slug: string;
  name: string;
  era: string;
  blog_url: string;
  headshot_path: string;
  tier: PersonaTier;
}

const PERSONAS_DIR = join(process.cwd(), "personas");

let cache: Map<string, Persona> | null = null;

async function loadAll(): Promise<Map<string, Persona>> {
  if (cache) return cache;
  const entries = await readdir(PERSONAS_DIR);
  const files = entries.filter((f) => f.endsWith(".md"));
  const personas = new Map<string, Persona>();

  for (const file of files) {
    const raw = await readFile(join(PERSONAS_DIR, file), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as PersonaFrontmatter;
    if (!fm.slug || !fm.name || !fm.era) {
      throw new Error(`personas/${file}: missing required frontmatter (slug/name/era)`);
    }
    personas.set(fm.slug, {
      slug: fm.slug,
      name: fm.name,
      era: fm.era,
      blogUrl: fm.blog_url,
      headshotPath: fm.headshot_path,
      tier: fm.tier ?? "B",
      systemPrompt: parsed.content.trim(),
    });
  }

  cache = personas;
  return personas;
}

export async function getPersona(slug: string): Promise<Persona> {
  const personas = await loadAll();
  const persona = personas.get(slug);
  if (!persona) {
    throw new Error(`Unknown persona slug: ${slug}`);
  }
  return persona;
}

export async function getPersonaForSource(slug: string): Promise<Persona> {
  try {
    return await getPersona(slug);
  } catch {
    const source = FOUNDER_SOURCE_BY_SLUG.get(slug);
    if (!source) throw new Error(`Unknown persona slug: ${slug}`);

    return {
      slug: source.slug,
      name: source.name,
      era: source.era,
      blogUrl: source.sourceUrl,
      headshotPath: `/avatars/${source.slug}.png`,
      tier: source.tier ?? "B",
      systemPrompt: `You are an AI research agent analyzing public writing by ${source.name}.

Do not impersonate ${source.name}, claim to be ${source.name}, or imply live access to them.
Answer only from retrieved source passages. If the passages do not support a useful answer, opt out.
Be direct, cite the source indices supplied by the user prompt, and clearly mark uncertainty.`,
    };
  }
}

export async function listPersonas(): Promise<Persona[]> {
  const personas = await loadAll();
  return Array.from(personas.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function clearPersonaCache(): void {
  cache = null;
}

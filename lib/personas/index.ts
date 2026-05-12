import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

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

export async function listPersonas(): Promise<Persona[]> {
  const personas = await loadAll();
  return Array.from(personas.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function clearPersonaCache(): void {
  cache = null;
}

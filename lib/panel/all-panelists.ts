import { FOUNDER_SOURCES } from "@/data/founder-sources";

/**
 * Static metadata for the full corpus. The source registry is the single list
 * of founder-authored blogs/newsletters/essays that can be ingested.
 */

export interface PanelistMeta {
  slug: string;
  name: string;
  era: string;
  avatarPath: string;
  blogUrl: string;
  tier: "A" | "B";
}

export const ALL_PANELISTS: ReadonlyArray<PanelistMeta> = FOUNDER_SOURCES.map(
  (source) => ({
    slug: source.slug,
    name: source.name,
    era: source.era,
    avatarPath: `/avatars/${source.slug}.png`,
    blogUrl: source.sourceUrl,
    tier: source.tier ?? "B",
  }),
);

const BY_SLUG = new Map(ALL_PANELISTS.map((p) => [p.slug, p]));

export function panelistMeta(slug: string): PanelistMeta {
  const meta = BY_SLUG.get(slug);
  if (!meta) throw new Error(`Unknown panelist slug: ${slug}`);
  return meta;
}

/**
 * Static metadata for the full corpus. Mirrors the slugs in /personas/*.md
 * and the source URLs in DESIGN.md.
 *
 * Used at runtime by the client to prerender all panel slots before
 * /api/panel/select returns. Non-chosen slots fade to opacity 0; the 5
 * chosen brighten to opacity 1. The layout itself is the loading state.
 */

export interface PanelistMeta {
  slug: string;
  name: string;
  era: string;
  avatarPath: string;
  blogUrl: string;
  tier: "A" | "B";
}

export const ALL_PANELISTS: ReadonlyArray<PanelistMeta> = [
  {
    slug: "paul-graham",
    name: "Paul Graham",
    era: "Y Combinator, 2005–present",
    avatarPath: "/avatars/paul-graham.png",
    blogUrl: "https://paulgraham.com",
    tier: "A",
  },
  {
    slug: "naval",
    name: "Naval Ravikant",
    era: "AngelList, 2010–present",
    avatarPath: "/avatars/naval.png",
    blogUrl: "https://nav.al",
    tier: "A",
  },
  {
    slug: "jason-fried",
    name: "Jason Fried",
    era: "37signals / Basecamp, 1999–present",
    avatarPath: "/avatars/jason-fried.png",
    blogUrl: "https://world.hey.com/jason",
    tier: "A",
  },
  {
    slug: "fred-wilson",
    name: "Fred Wilson",
    era: "USV / AVC.com, 2003–present",
    avatarPath: "/avatars/fred-wilson.png",
    blogUrl: "https://avc.com",
    tier: "B",
  },
  {
    slug: "sahil-lavingia",
    name: "Sahil Lavingia",
    era: "Gumroad, 2011–present",
    avatarPath: "/avatars/sahil-lavingia.png",
    blogUrl: "https://sahillavingia.com",
    tier: "B",
  },
  {
    slug: "patrick-collison",
    name: "Patrick Collison",
    era: "Stripe, 2010–present",
    avatarPath: "/avatars/patrick-collison.png",
    blogUrl: "https://patrickcollison.com",
    tier: "B",
  },
  {
    slug: "sam-altman",
    name: "Sam Altman",
    era: "YC → OpenAI, 2011–present",
    avatarPath: "/avatars/sam-altman.png",
    blogUrl: "https://blog.samaltman.com",
    tier: "B",
  },
  {
    slug: "garry-tan",
    name: "Garry Tan",
    era: "Initialized → YC, 2011–present",
    avatarPath: "/avatars/garry-tan.png",
    blogUrl: "https://garrytan.com",
    tier: "B",
  },
  {
    slug: "david-heinemeier-hansson",
    name: "David Heinemeier Hansson",
    era: "37signals / Rails, 2003–present",
    avatarPath: "/avatars/david-heinemeier-hansson.png",
    blogUrl: "https://world.hey.com/dhh",
    tier: "A",
  },
  {
    slug: "brian-chesky",
    name: "Brian Chesky",
    era: "Airbnb, 2008–present",
    avatarPath: "/avatars/brian-chesky.png",
    blogUrl: "https://medium.com/@bchesky",
    tier: "B",
  },
  {
    slug: "tobi-lutke",
    name: "Tobi Lütke",
    era: "Shopify, 2004–present",
    avatarPath: "/avatars/tobi-lutke.png",
    blogUrl: "https://tobi.lutke.com",
    tier: "B",
  },
  {
    slug: "eugene-wei",
    name: "Eugene Wei",
    era: "Remains of the Day, 2002–present",
    avatarPath: "/avatars/eugene-wei.png",
    blogUrl: "https://www.eugenewei.com",
    tier: "A",
  },
];

const BY_SLUG = new Map(ALL_PANELISTS.map((p) => [p.slug, p]));

export function panelistMeta(slug: string): PanelistMeta {
  const meta = BY_SLUG.get(slug);
  if (!meta) throw new Error(`Unknown panelist slug: ${slug}`);
  return meta;
}

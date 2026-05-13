/**
 * Curated topic seed list. Source of truth for what summaries get generated.
 *
 * Adding a topic here + running `bun run scripts/generate-summaries.ts`
 * produces an 8-row insert (one per founder) that becomes browseable at
 * /think/[founder]/[topic].
 *
 * Topics are intentionally founder-relevant: each should be something at least
 * 4 of the 8 founders have written about. Topics where most founders would
 * opt out (no relevant chunks above the similarity threshold) waste inference
 * and produce empty library pages.
 */

export interface Topic {
  slug: string;
  label: string;
  /** One sentence used as the meta description and the topic-page subtitle. */
  description: string;
  category: TopicCategory;
}

export type TopicCategory =
  | "strategy"
  | "founders-and-teams"
  | "product"
  | "growth-and-users"
  | "work-and-life"
  | "macro";

export const TOPICS: ReadonlyArray<Topic> = [
  // Strategy & fundraising
  {
    slug: "raising-venture-capital",
    label: "Raising venture capital",
    description: "When to raise, when to skip, who to take money from.",
    category: "strategy",
  },
  {
    slug: "when-to-raise",
    label: "Timing your fundraise",
    description: "The right moment to raise, and the price of raising too early.",
    category: "strategy",
  },
  {
    slug: "bootstrapping",
    label: "Bootstrapping",
    description: "Building a profitable company without outside capital.",
    category: "strategy",
  },
  {
    slug: "choosing-investors",
    label: "Choosing investors",
    description: "Which VCs to take money from, which to walk away from.",
    category: "strategy",
  },
  {
    slug: "dilution-and-ownership",
    label: "Dilution and ownership",
    description: "How much of the company founders should own at each stage.",
    category: "strategy",
  },
  {
    slug: "fundraising-negotiation",
    label: "Negotiating term sheets",
    description: "What to fight for, what to give up, what to walk on.",
    category: "strategy",
  },

  // Founders & teams
  {
    slug: "finding-a-cofounder",
    label: "Finding a cofounder",
    description: "Where to look, what to look for, when to go solo.",
    category: "founders-and-teams",
  },
  {
    slug: "firing-a-cofounder",
    label: "Firing a cofounder",
    description: "When the partnership stops working and what to do about it.",
    category: "founders-and-teams",
  },
  {
    slug: "early-hires",
    label: "Your first hires",
    description: "Who to hire first, how to interview, what to pay.",
    category: "founders-and-teams",
  },
  {
    slug: "compensation-and-equity",
    label: "Compensation and equity",
    description: "Splitting equity, paying market, when to be cheap.",
    category: "founders-and-teams",
  },
  {
    slug: "founder-mode",
    label: "Founder mode",
    description: "Why founders run companies differently than managers do.",
    category: "founders-and-teams",
  },
  {
    slug: "equity-splits",
    label: "Equity splits between cofounders",
    description: "50/50 versus 60/40 versus 'figure it out later'.",
    category: "founders-and-teams",
  },

  // Product
  {
    slug: "product-market-fit",
    label: "Product-market fit",
    description: "What it actually feels like and how to know you have it.",
    category: "product",
  },
  {
    slug: "pivoting",
    label: "Pivoting",
    description: "When to abandon the original idea and what to pivot toward.",
    category: "product",
  },
  {
    slug: "choosing-problems-to-solve",
    label: "Choosing the right problem",
    description: "How to pick a problem worth years of your life.",
    category: "product",
  },
  {
    slug: "shipping-faster",
    label: "Shipping fast",
    description: "Why velocity matters more than polish in early stage.",
    category: "product",
  },
  {
    slug: "pricing",
    label: "Pricing",
    description: "How to price a new product when there is no comparable.",
    category: "product",
  },
  {
    slug: "saying-no-to-features",
    label: "Saying no to features",
    description: "Which feature requests to ignore and which signal a real need.",
    category: "product",
  },
  {
    slug: "leverage",
    label: "Leverage",
    description: "The kinds of leverage available to founders today.",
    category: "product",
  },

  // Growth & users
  {
    slug: "talking-to-users",
    label: "Talking to users",
    description: "How to interview users without leading them.",
    category: "growth-and-users",
  },
  {
    slug: "early-traction",
    label: "Getting early traction",
    description: "First 10 users, first 100, first paying customer.",
    category: "growth-and-users",
  },
  {
    slug: "distribution",
    label: "Distribution",
    description: "Why distribution beats a better product, and how to build it.",
    category: "growth-and-users",
  },
  {
    slug: "growth-at-all-costs",
    label: "Growth at all costs",
    description: "When chasing growth is the right call and when it isn't.",
    category: "growth-and-users",
  },

  // Work & life
  {
    slug: "founder-burnout",
    label: "Founder burnout",
    description: "Why founders burn out and what actually helps.",
    category: "work-and-life",
  },
  {
    slug: "focus",
    label: "Focus",
    description: "The discipline of saying no to the second-best opportunity.",
    category: "work-and-life",
  },
  {
    slug: "ambition",
    label: "Ambition",
    description: "How big to think and when ambition becomes self-deception.",
    category: "work-and-life",
  },
  {
    slug: "quitting-your-job",
    label: "Quitting your day job",
    description: "When to leave a good job to start something.",
    category: "work-and-life",
  },

  // Macro
  {
    slug: "ai-and-startups",
    label: "AI and startups",
    description: "What AI changes about building a company today.",
    category: "macro",
  },
  {
    slug: "starting-a-startup-now",
    label: "Starting a startup now",
    description: "Whether the current moment is a good time to start one.",
    category: "macro",
  },
  {
    slug: "when-not-to-start",
    label: "When NOT to start a startup",
    description: "The honest case for not doing this.",
    category: "macro",
  },
];

const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export function topicBySlug(slug: string): Topic | null {
  return BY_SLUG.get(slug) ?? null;
}

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  strategy: "Strategy & fundraising",
  "founders-and-teams": "Founders & teams",
  product: "Product",
  "growth-and-users": "Growth & users",
  "work-and-life": "Work & life",
  macro: "Macro",
};

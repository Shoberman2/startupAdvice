/**
 * Hand-curated profile content for each founder in the corpus.
 *
 * Source-of-truth contract:
 *   - Every slug here MUST exist in personas/*.md (cross-checked in ./index.ts).
 *   - Every persona on disk MUST have a profile here (also cross-checked).
 *   - name / era / blog_url live in personas frontmatter, NOT here, to keep
 *     one source of truth for the corpus shape.
 *
 * Initial bios drafted from public knowledge — proofread before relying on
 * specific dates or company facts. Keep entries short: 2-3 sentence bio,
 * 3-5 signature ideas, 2-4 wins, 1-3 failures, one-line why_listen.
 */
export interface FounderProfile {
  slug: string;
  /** Short company / role line shown next to the name in the index. */
  company: string;
  /** 2-3 sentence biography. Reads as the opening of a chapter. */
  bio: string;
  /** Recurring themes or phrases this founder is known for. */
  signature_ideas: string[];
  /** Things they shipped / scaled / built that became canon. */
  notable_wins: string[];
  /** Things that didn't work — included on purpose. The page is about
   *  pattern-matching their judgment, not selling them. */
  notable_failures: string[];
  /** One sentence: why their advice is worth your reading time. */
  why_listen: string;
}

const PROFILES: ReadonlyArray<FounderProfile> = [
  {
    slug: "paul-graham",
    company: "Y Combinator",
    bio: "Co-founded Viaweb (sold to Yahoo, 1998), then Y Combinator with Jessica Livingston, Robert Morris, and Trevor Blackwell in 2005. Wrote ~200 essays from the early 2000s onward that became the de facto canon for early-stage startup advice.",
    signature_ideas: [
      "Do things that don't scale",
      "Make something people want",
      "Schlep blindness",
      "Live in the future, then build what's missing",
    ],
    notable_wins: [
      "Viaweb → Yahoo Store (1998)",
      "Y Combinator's batch model",
      "Hacker News",
    ],
    notable_failures: [
      "Arc (programming language with limited adoption)",
      "Several predictions on big-co stagnation that didn't pan out on the predicted timeline",
    ],
    why_listen:
      "The most-cited startup essayist of the 2000s and 2010s, with patterns drawn from observing thousands of YC companies up close.",
  },
  {
    slug: "naval",
    company: "AngelList",
    bio: "Co-founded Epinions, then Vast.com, then AngelList (2010). Distills wealth-building, leverage, judgment, and happiness into compressed Twitter threads and long-form podcast episodes.",
    signature_ideas: [
      "Specific knowledge × leverage × judgment",
      "Play long-term games with long-term people",
      "Seek wealth, not money or status",
      "Code and media are permissionless leverage",
    ],
    notable_wins: [
      "AngelList (changed how seed-stage startups raise)",
      "How to Get Rich (tweet-storm and podcast canon)",
    ],
    notable_failures: [
      "Epinions internal conflicts that lost founder equity",
      "Public dispute with Calacanis over AngelList early equity",
    ],
    why_listen:
      "Compresses wealth and leverage to first principles in tweet-length aphorisms that hold up under pressure.",
  },
  {
    slug: "jason-fried",
    company: "37signals / Basecamp",
    bio: "Co-founded 37signals (1999, later renamed Basecamp) and HEY. Co-author of Rework, Remote, and It Doesn't Have to Be Crazy at Work. One of the longest-running bootstrapped operators in software.",
    signature_ideas: [
      "Calm company",
      "Shape Up (over Scrum)",
      "Bootstrap, profit, stay small",
      "Anti-VC operating",
    ],
    notable_wins: [
      "Basecamp (20+ years profitable, bootstrapped)",
      "Rework, Remote, It Doesn't Have to Be Crazy at Work",
      "ONCE one-time-payment software line",
    ],
    notable_failures: [
      "HEY email launch tangled with App Store fee politics",
      "Anti-DEI Basecamp memo (2021) lost ~⅓ of staff",
    ],
    why_listen:
      "Rare working operator who has run the same calm, profitable software company for two decades against industry orthodoxy.",
  },
  {
    slug: "patrick-collison",
    company: "Stripe",
    bio: "With brother John, founded Stripe (2010) — payments infrastructure now used by millions of businesses worldwide. Earlier sold Auctomatic at 19. Widely-read on progress studies, scientific funding, and long-arc economic growth.",
    signature_ideas: [
      "Progress studies as a field",
      "Infrastructure that compounds for decades",
      "Read widely outside your industry",
      "Pace as a competitive advantage",
    ],
    notable_wins: [
      "Stripe (>$1T processed annually at peak)",
      "Fast Grants (COVID-era science funding)",
      "patrickcollison.com/questions (long-running list of generative open questions)",
    ],
    notable_failures: [
      "Stripe internal valuation cut from $95B to $50B in 2023",
      "First job (Auctomatic) didn't escape velocity at scale",
    ],
    why_listen:
      "Operator-intellectual building one of the most consequential pieces of internet infrastructure of the 2010s and 2020s.",
  },
  {
    slug: "sam-altman",
    company: "OpenAI",
    bio: "Founded Loopt (YC class of 2005), then ran Y Combinator as President from 2014 to 2019, then CEO of OpenAI from 2019. Briefly fired by the OpenAI board in November 2023 and reinstated within five days.",
    signature_ideas: [
      "Conviction in compute scaling",
      "Long-term thinking over consensus",
      "Move quickly on reversible decisions",
      "Willfulness as strategy",
    ],
    notable_wins: [
      "OpenAI (ChatGPT, GPT-4, GPT-5 era)",
      "YC growth and Continuity fund during his presidency",
    ],
    notable_failures: [
      "Loopt sold to Green Dot for ~$43M after years of struggle",
      "November 2023 board ouster (extremely public)",
    ],
    why_listen:
      "One of the most consequential operator-leaders of the modern AI era, with a paper trail going back to 2007.",
  },
  {
    slug: "fred-wilson",
    company: "Union Square Ventures",
    bio: "Co-founded Union Square Ventures (2003) with Brad Burnham. Previously co-founded Flatiron Partners in the late 1990s. Has blogged daily at AVC.com since 2003 — the longest-running active VC blog on the internet.",
    signature_ideas: [
      "Networks of networks",
      "Long-term price discipline",
      "Patience with breakout outliers",
      "Write in public, daily, for decades",
    ],
    notable_wins: [
      "USV portfolio (Twitter, Etsy, Tumblr, Coinbase, Duolingo, MongoDB)",
      "Daily writing discipline at AVC.com (2003–present)",
    ],
    notable_failures: [
      "Tumblr sold to Yahoo for $1.1B (2013), later written down",
      "Several public crypto-cycle calls that aged poorly",
    ],
    why_listen:
      "20+ years of transparent VC thinking in public, in real time, with the receipts to back the pattern-matching.",
  },
  {
    slug: "sahil-lavingia",
    company: "Gumroad",
    bio: "Founded Gumroad (2011) at 19, after leaving Pinterest as one of its earliest employees. Famously pivoted Gumroad from a high-growth VC trajectory to a small, profitable, mostly-remote operation after the original scale plan stalled.",
    signature_ideas: [
      "Minimum viable company",
      "Sell shovels (creator infrastructure)",
      "Permissionless work and async by default",
      "Cap your ambition, not your output",
    ],
    notable_wins: [
      "Gumroad's bootstrapped second act (post-2016)",
      "The Minimalist Entrepreneur (book)",
    ],
    notable_failures: [
      "Original Gumroad VC trajectory (2012–2015) didn't reach escape velocity",
      "Significant 2015 layoffs as growth flatlined",
    ],
    why_listen:
      "One of the most public stories of resetting from 'next big thing' to 'small and good' — with the financials shown openly.",
  },
  {
    slug: "garry-tan",
    company: "Y Combinator",
    bio: "Designer-engineer turned investor. Co-founded Posterous (acquired by Twitter, 2012), was an early YC partner, co-founded Initialized Capital (2011), then took over Y Combinator as President and CEO in 2022.",
    signature_ideas: [
      "Design as compounding competitive advantage",
      "Founder-as-creator",
      "San Francisco optimism",
      "Make the wedge as narrow as you can",
    ],
    notable_wins: [
      "Initialized portfolio (Coinbase, Instacart, Cruise, Flexport — early checks)",
      "YC reinvigoration and growth under his presidency",
    ],
    notable_failures: [
      "Posterous didn't reach scale (acqui-hired to Twitter, 2012)",
      "Public Twitter / X controversies as YC President",
    ],
    why_listen:
      "Active operator-investor with strong design taste and the current YC vantage point on early-stage startups.",
  },
  {
    slug: "david-heinemeier-hansson",
    company: "37signals / Basecamp",
    bio: "Created Ruby on Rails (2004) while building Basecamp at 37signals. Co-author of multiple Basecamp books with Jason Fried. Vocal critic of mainstream tech industry orthodoxies — VC, microservices, cloud-only, DEI policies in workplaces.",
    signature_ideas: [
      "Conceptual compression",
      "Open source as a career",
      "Anti-microservices for small teams",
      "Leave the cloud (server ownership)",
    ],
    notable_wins: [
      "Ruby on Rails (still powers GitHub, Shopify, Basecamp, much of the web)",
      "Basecamp, HEY, ONCE product line",
    ],
    notable_failures: [
      "Basecamp 2021 political-speech ban triggered ~⅓ staff resignations",
      "HEY launch costs vs App Store fee politics dispute",
    ],
    why_listen:
      "Rare combination of working operator and prolific open-source tooling builder, with a strongly contrarian point of view.",
  },
  {
    slug: "brian-chesky",
    company: "Airbnb",
    bio: "Co-founded Airbnb (2008) with Joe Gebbia and Nathan Blecharczyk. RISD-trained industrial designer. Led Airbnb through near-collapse during COVID-19 to a successful IPO in December 2020. Has refocused on design-led product development under his Founder Mode framing.",
    signature_ideas: [
      "Founder Mode",
      "11-star experience design",
      "Design-led leadership",
      "Cut what doesn't move the needle",
    ],
    notable_wins: [
      "Airbnb IPO (December 2020)",
      "Surviving COVID-19 (~80% revenue collapse) and emerging profitable",
      "Original Airbnb design ethos and brand",
    ],
    notable_failures: [
      "Pre-IPO regulatory wars in NYC, Berlin, and Barcelona",
      "Several party-house safety crises",
    ],
    why_listen:
      "Designer-operator with a contrarian, design-first take on what running a tech company actually requires.",
  },
  {
    slug: "tobi-lutke",
    company: "Shopify",
    bio: "Built a snowboarding e-commerce store (Snowdevil, Ottawa, 2004) using Rails; the underlying platform became Shopify in 2006. Has been CEO ever since — one of the longest-tenured operator-CEOs in modern commerce.",
    signature_ideas: [
      "Compounding craft",
      "AI as table stakes, not garnish",
      "First-principles operating",
      "Marathon mindset over sprints",
    ],
    notable_wins: [
      "Shopify (>$100B at peak, powers a meaningful share of online commerce)",
      "Long-tenured founder-CEO of a public company",
    ],
    notable_failures: [
      "Shopify 2022 over-hiring and ~10% then ~20% layoffs",
      "Reversing on remote-only and cancelling all meetings (mixed reception)",
    ],
    why_listen:
      "One of the longest-tenured first-principles operator-CEOs in modern commerce.",
  },
  {
    slug: "eugene-wei",
    company: "Remains of the Day",
    bio: "One of Amazon's earliest employees; later led product at Hulu, Flipboard, and Oculus Video. Best known publicly for his long-form essays at eugenewei.com — published rarely, but each one tends to circulate for years.",
    signature_ideas: [
      "Status as a Service",
      "Network effects beyond pure utility",
      "Cultural osmosis as a product surface",
      "The invisible asymptote",
    ],
    notable_wins: [
      "Status as a Service (essay that reframed social-product thinking)",
      "The Invisible Asymptote (essay on Amazon-era growth limits)",
    ],
    notable_failures: [
      "Doesn't publish failures in the conventional sense — but operated through several big-co product transitions where the products underperformed",
    ],
    why_listen:
      "Strategist-essayist with deep operator background; one of the sharpest cultural-product analysts working today.",
  },
];

export const FOUNDERS_BY_SLUG: ReadonlyMap<string, FounderProfile> = new Map(
  PROFILES.map((p) => [p.slug, p]),
);

export const ALL_PROFILES: ReadonlyArray<FounderProfile> = PROFILES;

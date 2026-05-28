import { createHash } from "node:crypto";
import { formatAdviceContext, type AdviceContext } from "@/lib/advice-context";
import { ALL_PANELISTS, panelistMeta } from "@/lib/panel/all-panelists";
import { FOUNDER_SOURCE_BY_SLUG } from "@/data/founder-sources";
import { FOUNDERS_BY_SLUG, isDirectoryOnly } from "@/lib/founders/profiles";
import type { DebateSession, DebateWithLatest } from "@/lib/debates";

export const LOCAL_DEMO_HASH_PREFIX = "local-demo:";
export const LOCAL_DEMO_CHAT_PREFIX = "local-demo-chat:";

interface LocalPanelResponse {
  retrieved: { index: number; title: string; url: string; paragraph_idx: number }[];
  receipts: { citation_index: number; claim: string }[];
  weighing: string;
  interpretation: string;
  recommendation: string;
  next_steps: string[];
  answer: string;
  opted_out?: { reason: string };
}

interface LocalChatResponse {
  retrieved: { index: number; title: string; url: string; paragraph_idx: number }[];
  answer: string;
  opted_out?: { reason: string };
}

const PANELIST_KEYWORDS: Record<string, string[]> = {
  "paul-graham": [
    "fundraise",
    "fundraising",
    "raise",
    "startup",
    "users",
    "mvp",
    "pivot",
    "cofounder",
  ],
  naval: ["leverage", "wealth", "status", "judgment", "fundraise", "market", "solo"],
  "jason-fried": ["bootstrap", "bootstrapping", "profit", "small", "calm", "pricing", "feature"],
  "fred-wilson": ["venture", "vc", "network", "marketplace", "investor", "fundraise"],
  "sahil-lavingia": ["bootstrap", "creator", "profit", "burnout", "solo", "small"],
  "patrick-collison": ["infrastructure", "developer", "speed", "hiring", "fundraise", "product"],
  "sam-altman": ["ai", "scale", "ambition", "hire", "fundraise", "conviction"],
  "garry-tan": ["yc", "fundraise", "design", "founder", "consumer", "ai"],
  "david-heinemeier-hansson": ["bootstrap", "profit", "remote", "calm", "small", "vc"],
  "brian-chesky": ["marketplace", "brand", "experience", "users", "design", "founder-mode"],
  "tobi-lutke": ["product", "craft", "systems", "developer", "culture", "ai"],
  "eugene-wei": ["network", "status", "social", "marketplace", "growth", "product"],
};

const DEFAULT_PANEL = [
  "paul-graham",
  "jason-fried",
  "naval",
  "fred-wilson",
  "patrick-collison",
];

export function localDemoEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DISABLE_LOCAL_DEMO !== "1";
}

export function shouldUseLocalDemoByDefault(): boolean {
  return (
    localDemoEnabled() &&
    (process.env.PANEL_LIVE_MODE === "local_demo" ||
      (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY))
  );
}

export function localDemoQuestionHash(question: string): string {
  return `${LOCAL_DEMO_HASH_PREFIX}${createHash("sha256").update(question).digest("hex")}`;
}

export function isLocalDemoQuestionHash(hash: string): boolean {
  return hash.startsWith(LOCAL_DEMO_HASH_PREFIX);
}

export function localDemoChatId(founderSlug: string): string {
  return `${LOCAL_DEMO_CHAT_PREFIX}${founderSlug}`;
}

export function isLocalDemoChatId(id: string): boolean {
  return id.startsWith(LOCAL_DEMO_CHAT_PREFIX);
}

export function localDemoSelectPanel(question: string): {
  authorSlugs: string[];
  questionHash: string;
  thresholdMisses: string[];
} {
  const q = question.toLowerCase();
  const scores = ALL_PANELISTS.map((panelist, index) => {
    const keywords = PANELIST_KEYWORDS[panelist.slug] ?? [];
    const keywordScore = keywords.reduce((sum, keyword) => {
      return q.includes(keyword) ? sum + 10 : sum;
    }, 0);
    const defaultScore = DEFAULT_PANEL.includes(panelist.slug) ? 5 : 0;
    return {
      slug: panelist.slug,
      score: keywordScore + defaultScore + (ALL_PANELISTS.length - index) / 100,
    };
  });

  const authorSlugs = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.slug);

  return {
    authorSlugs,
    questionHash: localDemoQuestionHash(question),
    thresholdMisses: ALL_PANELISTS.map((p) => p.slug).filter((slug) => !authorSlugs.includes(slug)),
  };
}

export function localDemoPanelResponse(
  founderSlug: string,
  question: string,
  adviceContext: AdviceContext,
): LocalPanelResponse {
  const meta = panelistMeta(founderSlug);
  const profile = FOUNDERS_BY_SLUG.get(founderSlug);
  if (!profile || isDirectoryOnly(profile)) {
    const source = FOUNDER_SOURCE_BY_SLUG.get(founderSlug);
    if (source) {
      return {
        retrieved: [],
        receipts: [],
        weighing: "Local demo mode has source metadata but no embedded blog chunks for this founder.",
        interpretation: `${source.name}'s public source is registered at ${source.sourceUrl}.`,
        recommendation: `Run bun run scrape -- --only ${source.slug} with a reachable DATABASE_URL and embedding key before using this founder for source-backed advice.`,
        next_steps: [
          `Dry-run the source with bun run scripts/scrape.ts --only ${source.slug} --dry-run.`,
          "Run the scraper with database and embedding credentials.",
          "Ask again after chunks have been embedded, so relevance can be checked against the actual writing.",
        ],
        answer: `Local demo mode: ${source.name} is in the 100-founder source registry, but this dev environment does not have embedded chunks from ${new URL(source.sourceUrl).host}. I am not applying this founder's writing to your question until the source has been scraped and passes relevance retrieval.`,
      };
    }
    return {
      retrieved: [],
      receipts: [],
      weighing: "",
      interpretation: "",
      recommendation: "",
      next_steps: [],
      answer: "",
      opted_out: { reason: "no_relevant_chunks" },
    };
  }

  const selectedAdvice = pickAdvice(profile.advice, question);
  const secondAdvice = profile.advice.find((item) => item !== selectedAdvice) ?? selectedAdvice;
  const context = formatAdviceContext(adviceContext);
  const hasContext = context !== "No extra startup context provided.";
  const questionText = question.trim() || "this question";

  return {
    retrieved: [],
    receipts: [
      {
        citation_index: 0,
        claim: `${meta.name}'s committed profile notes emphasize: ${selectedAdvice.headline}.`,
      },
      {
        citation_index: 0,
        claim: `${secondAdvice.headline}: ${secondAdvice.elaboration}`,
      },
    ],
    weighing: `Local demo mode: the live vector corpus is unreachable, so this column is using committed profile notes instead of retrieved essay chunks.`,
    interpretation: hasContext
      ? `${meta.name}'s profile would read your context through a practical constraint: ${context}`
      : `${meta.name}'s profile would first ask for sharper evidence about the customer, constraint, and next irreversible decision.`,
    recommendation: `${selectedAdvice.headline}. ${selectedAdvice.elaboration}`,
    next_steps: [
      "Write down the riskiest assumption behind the decision.",
      "Talk to five current or target users before changing strategy.",
      "Define the smallest one-week experiment that would change your mind.",
      "Revisit fundraising or hiring only after the experiment produces a signal.",
    ],
    answer: `Local demo mode: I cannot reach the live source corpus from this dev server, so this is a profile-backed preview rather than a cited corpus answer. For "${questionText}", the strongest ${meta.name} lens here is: ${selectedAdvice.headline}. ${selectedAdvice.elaboration}`,
  };
}

export function localDemoChatResponse(
  founderSlug: string,
  message: string,
): LocalChatResponse {
  const meta = panelistMeta(founderSlug);
  const profile = FOUNDERS_BY_SLUG.get(founderSlug);
  if (!profile || isDirectoryOnly(profile)) {
    const source = FOUNDER_SOURCE_BY_SLUG.get(founderSlug);
    if (source) {
      return {
        retrieved: [],
        answer: `Local demo mode: ${source.name} is registered as a founder source at ${source.sourceUrl}, but this dev environment has not embedded that writing. I am not going to apply unsupported advice to "${message}". Run bun run scrape -- --only ${source.slug} with database and embedding credentials, then ask again so relevance can be checked against the actual blog corpus.`,
      };
    }
    return {
      retrieved: [],
      answer: "",
      opted_out: { reason: "no_relevant_chunks" },
    };
  }

  const selectedAdvice = pickAdvice(profile.advice, message);
  return {
    retrieved: [],
    answer: `Local demo mode: the live corpus and model are not available in this dev environment, so this is a deterministic preview from ${meta.name}'s committed profile notes.\n\nFor "${message}", start with: ${selectedAdvice.headline}. ${selectedAdvice.elaboration}\n\nA useful next move is to turn that into one concrete test you can run this week, then compare the result against your actual runway and customer pull.`,
  };
}

export function localDemoDebateFeed(): {
  active: DebateWithLatest[];
  concluded: DebateSession[];
} {
  return { active: [], concluded: [] };
}

function pickAdvice<T extends { headline: string; elaboration: string }>(
  advice: readonly T[],
  prompt: string,
): T {
  const lowerPrompt = prompt.toLowerCase();
  const scored = advice.map((item, index) => {
    const adviceText = `${item.headline} ${item.elaboration}`.toLowerCase();
    const words = `${item.headline} ${item.elaboration}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3);
    const score = words.reduce((sum, word) => (lowerPrompt.includes(word) ? sum + 1 : sum), 0);
    return { item, score: score + topicBoost(lowerPrompt, adviceText), index };
  });
  return scored.sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item ?? advice[0];
}

function topicBoost(prompt: string, adviceText: string): number {
  const boostRules = [
    {
      prompt: ["raise", "fundraise", "funding", "venture", "capital", "runway"],
      advice: ["ramen", "default alive", "profit", "investor", "money", "capital"],
    },
    {
      prompt: ["bootstrap", "bootstrapping", "profit", "calm"],
      advice: ["profit", "small", "constraints", "bootstrapped", "calm"],
    },
    {
      prompt: ["pivot", "product", "mvp", "feature", "users"],
      advice: ["users", "product", "ship", "features", "want"],
    },
    {
      prompt: ["cofounder", "hire", "hiring", "team", "employee"],
      advice: ["hire", "people", "team", "long-term", "culture"],
    },
  ];

  return boostRules.reduce((sum, rule) => {
    const promptHit = rule.prompt.some((word) => prompt.includes(word));
    if (!promptHit) return sum;
    const adviceHits = rule.advice.filter((word) => adviceText.includes(word)).length;
    return sum + adviceHits * 3;
  }, 0);
}

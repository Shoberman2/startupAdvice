/**
 * Curated seed topics for the background debate cron.
 *
 * The seed includes a suggested roster — 3 to 5 founders who are most likely
 * to have substantive, contrasting positions on the topic. The cron picks the
 * least-recently-used topic when starting a new debate, and rotates the
 * roster suggestion order each time so the same founders aren't always at
 * position 0.
 *
 * To add a topic: append here, redeploy. To temporarily disable a topic:
 * comment it out — the cron skips disabled topics gracefully.
 */

import type { PanelistMeta } from "@/lib/panel/all-panelists";

export interface DebateTopicSeed {
  /** Unique stable id used for cross-reference. */
  slug: string;
  /** The question the founders are debating. */
  topic: string;
  /** Optional pointer to the matching /think topic for cross-linking. */
  thinkTopicSlug?: string;
  /** Suggested founders. The cron picks a subset of this in random order. */
  suggestedFounders: PanelistMeta["slug"][];
  /** Max turns for the debate. Most are 12 (about 2-3 statements per founder). */
  maxTurns?: number;
}

export const DEBATE_TOPICS: ReadonlyArray<DebateTopicSeed> = [
  {
    slug: "raise-or-bootstrap",
    topic: "Should an ambitious founder raise venture capital or bootstrap?",
    thinkTopicSlug: "raising-venture-capital",
    suggestedFounders: ["paul-graham", "jason-fried", "fred-wilson", "sahil-lavingia", "sam-altman"],
    maxTurns: 12,
  },
  {
    slug: "when-to-fire-cofounder",
    topic: "When does a struggling cofounder relationship cross from fixable to fire-them?",
    thinkTopicSlug: "firing-a-cofounder",
    suggestedFounders: ["paul-graham", "sam-altman", "garry-tan", "jason-fried"],
  },
  {
    slug: "should-you-quit-day-job",
    topic: "When should someone quit a stable job to start a company?",
    thinkTopicSlug: "quitting-your-job",
    suggestedFounders: ["paul-graham", "naval", "sahil-lavingia", "sam-altman", "fred-wilson"],
  },
  {
    slug: "when-to-pivot",
    topic: "How do you know when to pivot versus push through?",
    thinkTopicSlug: "pivoting",
    suggestedFounders: ["paul-graham", "patrick-collison", "sam-altman", "garry-tan"],
  },
  {
    slug: "growth-vs-profit",
    topic: "Is growth at all costs the right strategy, or is profit-first underrated?",
    thinkTopicSlug: "growth-at-all-costs",
    suggestedFounders: ["jason-fried", "fred-wilson", "sahil-lavingia", "sam-altman"],
  },
  {
    slug: "ai-eats-software",
    topic: "How is AI changing what it takes to start a successful company today?",
    thinkTopicSlug: "ai-and-startups",
    suggestedFounders: ["sam-altman", "garry-tan", "patrick-collison", "naval", "paul-graham"],
  },
  {
    slug: "founder-mode-vs-manager-mode",
    topic: "Should founders adopt 'founder mode' or learn to delegate like a manager?",
    thinkTopicSlug: "founder-mode",
    suggestedFounders: ["paul-graham", "patrick-collison", "garry-tan", "sam-altman"],
  },
  {
    slug: "leverage-and-ambition",
    topic: "What kind of leverage should a new founder pursue first — capital, code, media, or labor?",
    thinkTopicSlug: "leverage",
    suggestedFounders: ["naval", "sam-altman", "sahil-lavingia", "patrick-collison"],
  },
  {
    slug: "solo-or-cofounder",
    topic: "Is a solo founder at a real disadvantage, or has that wisdom aged poorly?",
    thinkTopicSlug: "finding-a-cofounder",
    suggestedFounders: ["paul-graham", "naval", "sahil-lavingia", "sam-altman"],
  },
  {
    slug: "talk-to-users",
    topic: "Is 'talk to users' the most overrated advice in startups, or the most underrated?",
    thinkTopicSlug: "talking-to-users",
    suggestedFounders: ["paul-graham", "sam-altman", "jason-fried", "garry-tan"],
  },
  {
    slug: "distribution-vs-product",
    topic: "If you had to pick one in the early stage — a better product or a better distribution channel — which wins?",
    thinkTopicSlug: "distribution",
    suggestedFounders: ["sam-altman", "garry-tan", "fred-wilson", "jason-fried"],
  },
  {
    slug: "say-no-to-investors",
    topic: "What's the right reason to walk away from a term sheet that on paper looks great?",
    thinkTopicSlug: "choosing-investors",
    suggestedFounders: ["paul-graham", "fred-wilson", "naval", "jason-fried"],
  },
  {
    slug: "ambition-calibration",
    topic: "How big should a first-time founder dare to think?",
    thinkTopicSlug: "ambition",
    suggestedFounders: ["sam-altman", "paul-graham", "garry-tan", "patrick-collison"],
  },
  {
    slug: "is-now-the-time",
    topic: "Is right now a better time to start a company than five years ago, or worse?",
    thinkTopicSlug: "starting-a-startup-now",
    suggestedFounders: ["sam-altman", "garry-tan", "naval", "paul-graham", "patrick-collison"],
  },
  {
    slug: "burnout-and-pace",
    topic: "Is startup burnout a sign you're doing it wrong, or just the price of admission?",
    thinkTopicSlug: "founder-burnout",
    suggestedFounders: ["jason-fried", "sahil-lavingia", "naval", "paul-graham"],
  },
];

const BY_SLUG = new Map(DEBATE_TOPICS.map((t) => [t.slug, t]));

export function debateTopicBySlug(slug: string): DebateTopicSeed | null {
  return BY_SLUG.get(slug) ?? null;
}

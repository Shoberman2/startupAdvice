#!/usr/bin/env bun
/**
 * Manually start a new debate from a topic in the queue, or from an ad-hoc
 * topic provided on the command line.
 *
 * Usage:
 *   bun run scripts/seed-debate.ts --slug raise-or-bootstrap
 *   bun run scripts/seed-debate.ts --topic "Is solo founding viable?" --founders paul-graham,naval,sahil-lavingia
 */

import { db } from "@/lib/db/client";
import { seedDebate } from "@/lib/debates";
import { DEBATE_TOPICS, debateTopicBySlug } from "@/data/debate-topics";
import { panelistMeta } from "@/lib/panel/all-panelists";

interface Args {
  slug?: string;
  topic?: string;
  founders?: string[];
  maxTurns?: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--slug") args.slug = argv[++i];
    else if (argv[i] === "--topic") args.topic = argv[++i];
    else if (argv[i] === "--founders") args.founders = argv[++i].split(",");
    else if (argv[i] === "--max-turns") args.maxTurns = Number(argv[++i]);
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  let topic: string;
  let topicSlug: string | undefined;
  let founders: string[];
  let maxTurns: number | undefined = args.maxTurns;

  if (args.slug) {
    const seed = debateTopicBySlug(args.slug);
    if (!seed) {
      console.error(`Unknown slug "${args.slug}". Available:`);
      DEBATE_TOPICS.forEach((t) => console.error(`  - ${t.slug}`));
      process.exit(1);
    }
    topic = seed.topic;
    topicSlug = seed.thinkTopicSlug ?? seed.slug;
    founders = seed.suggestedFounders;
    if (maxTurns === undefined) maxTurns = seed.maxTurns;
  } else if (args.topic) {
    topic = args.topic;
    if (!args.founders || args.founders.length < 3) {
      console.error(
        `--topic requires --founders with at least 3 slugs (comma-separated)`,
      );
      process.exit(1);
    }
    founders = args.founders;
  } else {
    console.error("Pass either --slug <queue-slug> or --topic <\"...\"> with --founders");
    process.exit(1);
  }

  // Validate every founder slug.
  for (const f of founders) {
    try {
      panelistMeta(f);
    } catch {
      console.error(`Unknown founder slug: ${f}`);
      process.exit(1);
    }
  }

  const session = await seedDebate({ topic, topicSlug, founders, maxTurns });
  console.log(`Seeded debate ${session.id}`);
  console.log(`  Topic:    ${session.topic}`);
  console.log(`  Founders: ${session.founders.join(", ")}`);
  console.log(`  Max turns: ${session.maxTurns}`);

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

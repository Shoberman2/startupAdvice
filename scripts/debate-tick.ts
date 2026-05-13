#!/usr/bin/env bun
/**
 * Manually advance one debate by one turn. Useful for testing the tick logic
 * without waiting for the cron, or for running locally against your dev DB.
 *
 * Usage:
 *   bun run scripts/debate-tick.ts            # one tick
 *   bun run scripts/debate-tick.ts --turns 5  # tick 5 times in a row
 */

import { db } from "@/lib/db/client";
import { tickOnce } from "@/lib/debates/tick";

interface Args {
  turns: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { turns: 1 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--turns") args.turns = Math.max(1, Number(argv[++i]));
  }
  return args;
}

async function main(): Promise<void> {
  const { turns } = parseArgs(process.argv.slice(2));

  for (let i = 0; i < turns; i++) {
    const result = await tickOnce();
    switch (result.kind) {
      case "advanced":
        console.log(
          `[${i + 1}/${turns}] advanced ${result.session.id.slice(0, 8)} turn ${result.message.turnIndex}: ${result.speaker}`,
        );
        break;
      case "seeded":
        console.log(
          `[${i + 1}/${turns}] seeded new debate ${result.session.id.slice(0, 8)}: ${result.session.topic}`,
        );
        break;
      case "concluded":
        console.log(
          `[${i + 1}/${turns}] concluded ${result.session.id.slice(0, 8)} at ${result.session.turnCount} turns`,
        );
        break;
      case "skipped":
        console.log(`[${i + 1}/${turns}] skipped: ${result.reason}`);
        break;
      case "noop":
        console.log(`[${i + 1}/${turns}] noop: ${result.reason}`);
        break;
    }
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

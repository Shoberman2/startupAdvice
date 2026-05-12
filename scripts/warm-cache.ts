#!/usr/bin/env bun
/**
 * Pre-warm Vercel Runtime Cache by hitting each canonical question once. This
 * runs after deploy and before announcing the launch so the HN front-page
 * visitor on a canonical question gets an instant response.
 *
 * Usage:
 *   bun run scripts/warm-cache.ts                 # default to localhost
 *   BASE_URL=https://founderpanel.com bun run scripts/warm-cache.ts
 */

const CANONICAL_QUESTIONS = [
  "Should I raise venture capital now?",
  "When do I fire my cofounder?",
  "Should I quit my job to start something?",
  "Should I pivot?",
];

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

interface SelectResponse {
  author_slugs: string[];
  question_hash: string;
}

async function warmOne(question: string): Promise<void> {
  console.log(`warming: "${question}"`);
  const t0 = Date.now();

  const selectRes = await fetch(`${BASE}/api/panel/select`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!selectRes.ok) {
    console.error(`  /select failed: ${selectRes.status}`);
    return;
  }
  const sel = (await selectRes.json()) as SelectResponse;

  // Drive each per-panelist stream to completion so the cache populates fully.
  await Promise.all(
    sel.author_slugs.map(async (slug) => {
      const url = `${BASE}/api/panel/${encodeURIComponent(slug)}?qh=${encodeURIComponent(
        sel.question_hash,
      )}&q=${encodeURIComponent(question)}`;
      const r = await fetch(url);
      if (!r.body) return;
      const reader = r.body.getReader();
      // Drain the stream to completion.
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }),
  );

  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  warmed ${sel.author_slugs.length} panelists in ${dur}s`);
}

async function main(): Promise<void> {
  for (const q of CANONICAL_QUESTIONS) {
    await warmOne(q);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

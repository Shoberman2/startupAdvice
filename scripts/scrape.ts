#!/usr/bin/env bun
/**
 * Scrape + embed pipeline runner.
 *
 * For each scraper in lib/scrape/index.ts:
 *   1. Check robots.txt — skip the author if disallowed.
 *   2. List post URLs.
 *   3. Fetch each post, parse paragraphs, chunk at ~800 tokens with 100-token overlap.
 *   4. Compute chunk_hash. Skip chunks already in the DB (idempotent re-runs).
 *   5. Embed new chunks via OpenAI text-embedding-3-small.
 *   6. INSERT into chunks with ON CONFLICT DO NOTHING.
 *
 * Usage:
 *   bun run scripts/scrape.ts                    # all authors
 *   bun run scripts/scrape.ts --only paul-graham # just one
 *   bun run scripts/scrape.ts --dry-run          # list URLs only, no fetch
 *
 * Requires: DATABASE_URL, AI_GATEWAY_API_KEY (or OPENAI_API_KEY) in env.
 */

import { createOpenAI, openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { toSql } from "pgvector/pg";
import { db } from "@/lib/db/client";
import { ALL_SCRAPERS, scraperFor } from "@/lib/scrape";
import {
  type BlogScraper,
  chunkHash,
  chunkParagraphs,
  checkRobotsTxt,
} from "@/lib/scrape/base";

const OPENAI_EMBED_MODEL = "text-embedding-3-small";
const GATEWAY_EMBED_MODEL = `openai/${OPENAI_EMBED_MODEL}`;
const EMBED_BATCH = 32;

const gateway = createOpenAI({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const embeddingModel = process.env.AI_GATEWAY_API_KEY
  ? gateway.embedding(GATEWAY_EMBED_MODEL)
  : openai.embedding(OPENAI_EMBED_MODEL);

interface Args {
  only?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--only") args.only = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

async function scrapeAuthor(scraper: BlogScraper, dryRun: boolean): Promise<void> {
  const slug = scraper.authorSlug;
  console.log(`\n=== ${slug} (${scraper.authorName}) ===`);

  const allowed = await checkRobotsTxt(
    scraper.homeUrl ?? scraper.sitemapUrl ?? `https://${slug}.com`,
  );
  if (!allowed) {
    console.log(`  SKIP — robots.txt disallows`);
    return;
  }

  const urls = await scraper.listPostUrls();
  console.log(`  ${urls.length} posts in index`);

  if (dryRun) {
    urls.slice(0, 5).forEach((u) => console.log(`    ${u}`));
    if (urls.length > 5) console.log(`    … and ${urls.length - 5} more`);
    return;
  }

  let newChunks = 0;
  let skippedExisting = 0;
  let failedPosts = 0;

  // Process posts sequentially to respect politeFetch's per-domain rate limit.
  for (const url of urls) {
    let post;
    try {
      post = await scraper.fetchPost(url);
    } catch (e) {
      failedPosts++;
      console.log(`  FAIL ${url}: ${e instanceof Error ? e.message : e}`);
      continue;
    }

    if (!post.paragraphs.length) continue;

    const chunks = chunkParagraphs(post.paragraphs);
    const toInsert: {
      hash: string;
      paragraphIndex: number;
      text: string;
    }[] = [];

    // Filter out chunks already in the DB.
    for (const c of chunks) {
      const hash = chunkHash(slug, post.url, c.paragraphIndex, c.text);
      const existing = await db.query(
        `SELECT 1 FROM chunks WHERE chunk_hash = $1 LIMIT 1`,
        [hash],
      );
      if (existing.rowCount && existing.rowCount > 0) {
        skippedExisting++;
        continue;
      }
      toInsert.push({ hash, paragraphIndex: c.paragraphIndex, text: c.text });
    }

    if (!toInsert.length) continue;

    // Embed in batches.
    for (let i = 0; i < toInsert.length; i += EMBED_BATCH) {
      const batch = toInsert.slice(i, i + EMBED_BATCH);
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: batch.map((b) => b.text),
      });

      for (let j = 0; j < batch.length; j++) {
        await db.query(
          `INSERT INTO chunks
             (chunk_hash, author_slug, post_url, post_title, post_published,
              paragraph_index, text, embedding)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (chunk_hash) DO NOTHING`,
          [
            batch[j].hash,
            slug,
            post.url,
            post.title,
            post.published,
            batch[j].paragraphIndex,
            batch[j].text,
            toSql(embeddings[j]),
          ],
        );
      }
      newChunks += batch.length;
    }
  }

  console.log(
    `  done — new=${newChunks} skipped=${skippedExisting} failed=${failedPosts}`,
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const scrapers = args.only
    ? [scraperFor(args.only)].filter(Boolean) as BlogScraper[]
    : [...ALL_SCRAPERS];

  if (!scrapers.length) {
    console.error(`No scraper found for "${args.only}"`);
    process.exit(1);
  }

  for (const s of scrapers) {
    try {
      await scrapeAuthor(s, args.dryRun);
    } catch (e) {
      console.error(`${s.authorSlug} failed:`, e);
    }
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

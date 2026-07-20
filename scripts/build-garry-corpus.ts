/**
 * Build the local Garry Tan corpus for the /garry office-hours skill.
 *
 * Fetches every post from the blog.garrytan.com Posthaven Atom feed
 * (garrytan.com is a dead domain — see git history) and writes one markdown
 * file per substantive post to .claude/founders-corpus/garry-tan/, plus an
 * INDEX.md manifest.
 *
 * The corpus directory is gitignored on purpose: these are personal-use
 * research copies. Citations in skill answers always link back to the
 * canonical URL.
 *
 * Usage: bun run scripts/build-garry-corpus.ts [--max-pages N]
 */

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { htmlToParagraphs, politeFetch, checkRobotsTxt } from "../lib/scrape/base";

const FEED = "https://blog.garrytan.com/posts.atom";
const OUT_DIR = join(import.meta.dir, "..", ".claude", "founders-corpus", "garry-tan");
const MIN_POST_WORDS = 120;
const MAX_POST_WORDS = 15_000;

interface FeedPost {
  url: string;
  title: string;
  published: string; // YYYY-MM-DD
  paragraphs: string[];
  truncated: boolean;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseEntries(xml: string): FeedPost[] {
  const posts: FeedPost[] = [];
  for (const raw of xml.split("<entry>").slice(1)) {
    const entry = raw.split("</entry>")[0];
    const url = /<link rel="alternate"[^>]*href="([^"]+)"/.exec(entry)?.[1];
    const titleRaw = /<title>([\s\S]*?)<\/title>/.exec(entry)?.[1] ?? "Untitled";
    const published = /<published>([^<]+)<\/published>/.exec(entry)?.[1]?.slice(0, 10) ?? "unknown";
    const contentRaw = /<content type="html">([\s\S]*?)<\/content>/.exec(entry)?.[1] ?? "";
    if (!url) continue;
    const paragraphs = htmlToParagraphs(decodeXmlEntities(contentRaw), {
      tags: ["p", "blockquote", "li", "h2", "h3"],
    });
    // Posthaven truncates long posts in the feed at the "Read more" fold.
    while (paragraphs.length && /^Read more$/i.test(paragraphs[paragraphs.length - 1])) {
      paragraphs.pop();
    }
    const truncated = /class="posthaven-post-body-fold|>\s*Read more\s*<\/a>/i.test(contentRaw)
      || /Read more<\/a>/i.test(decodeXmlEntities(contentRaw));
    posts.push({ url, title: decodeXmlEntities(titleRaw).trim(), published, paragraphs, truncated });
  }
  return posts;
}

function slugFromUrl(url: string): string {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, "");
  return (path || "post").slice(0, 80);
}

async function main() {
  const maxPagesArg = process.argv.indexOf("--max-pages");
  const maxPages = maxPagesArg > -1 ? Number(process.argv[maxPagesArg + 1]) : 40;

  if (!(await checkRobotsTxt(FEED))) {
    console.error("robots.txt disallows fetching the feed; aborting.");
    process.exit(1);
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const all: FeedPost[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const xml = await politeFetch(page === 1 ? FEED : `${FEED}?page=${page}`);
    const posts = parseEntries(xml);
    if (posts.length === 0) break;
    all.push(...posts);
    console.log(`page ${page}: ${posts.length} posts (total ${all.length})`);
  }

  const seen = new Set<string>();
  const indexLines: string[] = [];
  let written = 0;
  let skipped = 0;
  let totalWords = 0;

  for (const post of all) {
    const slug = slugFromUrl(post.url);
    if (seen.has(slug)) continue;
    seen.add(slug);
    if (post.truncated) {
      // Fetch the full post page; the feed only carried the above-the-fold text.
      try {
        const html = await politeFetch(post.url);
        const full = htmlToParagraphs(html, {
          withinSelector: "div.post-body",
          tags: ["p", "blockquote", "li", "h2", "h3"],
        });
        if (full.length > post.paragraphs.length) post.paragraphs = full;
        console.log(`fetched full text: ${slug} (${post.paragraphs.length} paragraphs)`);
      } catch (e) {
        console.warn(`full-text fetch failed for ${post.url}; keeping feed excerpt`, e);
      }
    }
    const words = post.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    if (words < MIN_POST_WORDS || words > MAX_POST_WORDS) {
      skipped++;
      continue;
    }
    const file = `${post.published}-${slug}.md`;
    const body = [
      "---",
      `title: ${JSON.stringify(post.title)}`,
      `url: ${post.url}`,
      `published: ${post.published}`,
      "author: Garry Tan",
      "---",
      "",
      ...post.paragraphs.flatMap((p) => [p, ""]),
    ].join("\n");
    await writeFile(join(OUT_DIR, file), body);
    indexLines.push(`- ${post.published} — [${post.title}](${post.url}) — \`${file}\` — ${words}w`);
    written++;
    totalWords += words;
  }

  indexLines.sort().reverse();
  await writeFile(
    join(OUT_DIR, "INDEX.md"),
    [
      "# Garry Tan corpus index",
      "",
      `Source: ${FEED} — fetched ${new Date().toISOString().slice(0, 10)}`,
      `${written} posts, ${totalWords} words. Format: date — [title](canonical url) — \`file\` — words.`,
      "",
      ...indexLines,
      "",
    ].join("\n"),
  );

  console.log(`\nWrote ${written} substantive posts (${totalWords} words) to ${OUT_DIR} (${skipped} short/empty posts skipped).`);
}

main();

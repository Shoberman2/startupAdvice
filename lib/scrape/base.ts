/**
 * Shared scraper utilities. Each per-blog scraper module imports from here
 * and only writes site-specific selector logic.
 *
 * Contract: every BlogScraper exports listPostUrls() and fetchPost(url).
 * The shared helpers below cover politely fetching pages, parsing sitemaps,
 * checking robots.txt, and converting HTML to a paragraph array.
 */

import { unified } from "unified";
import rehypeParse from "rehype-parse";
import { toText } from "hast-util-to-text";
import type { Root, Element } from "hast";

const USER_AGENT = "FounderPanelBot/1.0 (+https://founderpanel.com/about)";

/** A single scraped essay. */
export interface Post {
  url: string;
  title: string;
  /** ISO date string (YYYY-MM-DD) or null when the blog doesn't expose one. */
  published: string | null;
  /** Paragraphs in document order, already trimmed and non-empty. */
  paragraphs: string[];
}

export interface BlogScraper {
  authorSlug: string;
  authorName: string;
  /** Canonical source/home URL for robots.txt and generic discovery. */
  homeUrl?: string;
  /** Either the canonical sitemap URL or an empty string when listing is bespoke. */
  sitemapUrl?: string;
  listPostUrls(): Promise<string[]>;
  fetchPost(url: string): Promise<Post>;
}

// ─── politeFetch ──────────────────────────────────────────────────────────────

const PER_DOMAIN_DELAY_MS = 1000;
const lastFetchByDomain = new Map<string, number>();

/**
 * Fetch with a 1 req/sec per-domain rate limit, retry on 5xx, and our UA.
 * Throws after 3 failed attempts.
 */
export async function politeFetch(url: string): Promise<string> {
  const domain = new URL(url).host;
  const now = Date.now();
  const last = lastFetchByDomain.get(domain) ?? 0;
  const wait = Math.max(0, PER_DOMAIN_DELAY_MS - (now - last));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetchByDomain.set(domain, Date.now());

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
      if (res.status >= 500 && res.status < 600) {
        lastError = new Error(`${url}: ${res.status}`);
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        throw new Error(`${url}: ${res.status} ${res.statusText}`);
      }
      return await res.text();
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

// ─── robots.txt ───────────────────────────────────────────────────────────────

/**
 * Returns true if our UA is allowed to fetch `urlOrDomain`. Conservative:
 * a missing robots.txt counts as allowed; a network error counts as DISALLOWED
 * so we don't accidentally hammer a site whose policy we can't read.
 *
 * This is intentionally a simple implementation. It handles User-agent stanzas
 * matching "*" or "FounderPanelBot", and Disallow rules; it does not implement
 * the full RFC 9309 grammar.
 */
export async function checkRobotsTxt(urlOrDomain: string): Promise<boolean> {
  const url = new URL(/^https?:/.test(urlOrDomain) ? urlOrDomain : `https://${urlOrDomain}`);
  const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
  let body: string;
  try {
    const res = await fetch(robotsUrl, { headers: { "user-agent": USER_AGENT } });
    if (res.status === 404) return true;
    if (!res.ok) return false;
    body = await res.text();
  } catch {
    return false;
  }

  const lines = body.split(/\r?\n/).map((l) => l.trim());
  let applies = false;
  const disallows: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.toLowerCase().trim();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      const ua = value.toLowerCase();
      applies = ua === "*" || ua === "founderpanelbot" || ua === "founderpanelbot/1.0";
      continue;
    }
    if (applies && key === "disallow" && value) {
      disallows.push(value);
    }
  }

  // Allowed unless any disallow rule matches the root or url path.
  return !disallows.some((rule) => rule === "/" || url.pathname.startsWith(rule));
}

// ─── parseSitemap ─────────────────────────────────────────────────────────────

/**
 * Extract <loc> URLs from a sitemap XML or sitemap-index. Recurses into nested
 * sitemap indexes one level deep.
 */
export async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  return parseSitemapInner(sitemapUrl, new Set(), 0);
}

async function parseSitemapInner(
  sitemapUrl: string,
  seen: Set<string>,
  depth: number,
): Promise<string[]> {
  if (seen.has(sitemapUrl) || depth > 3) return [];
  seen.add(sitemapUrl);

  const xml = await politeFetch(sitemapUrl);
  const isIndex = /<sitemapindex/i.test(xml);
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());

  if (!isIndex) return locs;

  // Sitemap index -> recurse into child sitemaps.
  const all: string[] = [];
  for (const child of locs) {
    try {
      all.push(...(await parseSitemapInner(child, seen, depth + 1)));
    } catch {
      // Skip unreadable child sitemaps. We'd rather have a partial corpus than crash.
    }
  }
  return all;
}

// ─── htmlToParagraphs ─────────────────────────────────────────────────────────

/**
 * Given a CSS-like selector tag list (e.g. ["p", "blockquote", "li"]) and an
 * HTML string, return the visible text content of each matching node as a
 * trimmed paragraph string. Empty paragraphs are dropped.
 *
 * Per-blog modules typically pass their content-area root via `withinSelector`
 * (a tag name or class — we keep this simple: a tag name or `tag.class`).
 */
export function htmlToParagraphs(
  html: string,
  options: { withinSelector?: string; tags?: string[] } = {},
): string[] {
  const { withinSelector, tags = ["p", "blockquote", "li"] } = options;
  const tree = unified().use(rehypeParse, { fragment: false }).parse(html) as Root;

  const root = withinSelector ? findFirst(tree, withinSelector) : tree;
  if (!root) return [];

  const paragraphs: string[] = [];
  walk(root, (node) => {
    if (node.type === "element" && tags.includes(node.tagName.toLowerCase())) {
      const text = toText(node, { whitespace: "normal" }).trim();
      if (text) paragraphs.push(text);
      return false; // Don't recurse into matched nodes — avoid duplicate <li> within nested <ul>.
    }
    return true;
  });

  return paragraphs;
}

function walk(node: Root | Element, visit: (n: Element) => boolean): void {
  if (!("children" in node) || !node.children) return;
  for (const child of node.children) {
    if (child.type === "element") {
      const recurse = visit(child);
      if (recurse) walk(child, visit);
    }
  }
}

function findFirst(node: Root | Element, selector: string): Element | null {
  const [tag, klass] = selector.split(".");
  let found: Element | null = null;
  walk(node, (n) => {
    if (found) return false;
    if (n.tagName.toLowerCase() === tag.toLowerCase()) {
      if (!klass) {
        found = n;
        return false;
      }
      const classes = ((n.properties?.className ?? []) as string[]).map(String);
      if (classes.includes(klass)) {
        found = n;
        return false;
      }
    }
    return true;
  });
  return found;
}

// ─── chunking ─────────────────────────────────────────────────────────────────

/**
 * Group consecutive paragraphs into chunks of approximately `targetTokens`
 * tokens (rough heuristic: 1 token ≈ 4 chars) with `overlapTokens` of overlap
 * between adjacent chunks. The paragraph_index recorded for each chunk is the
 * index of the FIRST paragraph in that chunk (used for citation back-pointers).
 */
export interface Chunk {
  paragraphIndex: number;
  text: string;
}

export function chunkParagraphs(
  paragraphs: string[],
  targetTokens = 800,
  overlapTokens = 100,
): Chunk[] {
  const TOK = 4; // chars per token, rough.
  const targetChars = targetTokens * TOK;
  const overlapChars = overlapTokens * TOK;
  const chunks: Chunk[] = [];

  let i = 0;
  while (i < paragraphs.length) {
    let length = 0;
    const start = i;
    while (i < paragraphs.length && length + paragraphs[i].length <= targetChars) {
      length += paragraphs[i].length + 2; // newline cost
      i++;
    }
    // Always include at least one paragraph even if it overflows.
    if (i === start) i = start + 1;
    const slice = paragraphs.slice(start, i);
    chunks.push({ paragraphIndex: start, text: slice.join("\n\n") });

    if (i >= paragraphs.length) break;

    // Walk back by `overlapChars` worth of paragraphs for overlap.
    let overlap = 0;
    let back = i;
    while (back > start + 1 && overlap < overlapChars) {
      back--;
      overlap += paragraphs[back].length;
    }
    if (back > start) i = back;
  }
  return chunks;
}

// ─── chunk hash ───────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";

export function chunkHash(
  authorSlug: string,
  postUrl: string,
  paragraphIndex: number,
  text: string,
): string {
  const h = createHash("sha256");
  h.update(authorSlug);
  h.update(" ");
  h.update(postUrl);
  h.update(" ");
  h.update(String(paragraphIndex));
  h.update(" ");
  h.update(text);
  return h.digest("hex");
}

import type { FounderSource } from "@/data/founder-sources";
import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const COMMON_FEED_PATHS = ["/feed", "/feed.xml", "/rss", "/rss.xml", "/atom.xml"];
const COMMON_SITEMAP_PATHS = ["/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml"];
const MAX_INDEX_LINKS = 500;

export function makeGenericScraper(source: FounderSource): BlogScraper {
  return {
    authorSlug: source.slug,
    authorName: source.name,
    homeUrl: source.sourceUrl,
    sitemapUrl: source.sitemapUrl,
    async listPostUrls() {
      return listSourcePostUrls(source);
    },
    async fetchPost(url: string) {
      return fetchGenericPost(url);
    },
  };
}

async function listSourcePostUrls(source: FounderSource): Promise<string[]> {
  const sitemapCandidates = unique([
    source.sitemapUrl,
    ...commonUrls(source.sourceUrl, COMMON_SITEMAP_PATHS),
  ]);
  for (const sitemapUrl of sitemapCandidates) {
    if (!sitemapUrl) continue;
    try {
      const urls = await parseSitemap(sitemapUrl);
      const filtered = filterPostUrls(urls, source.sourceUrl);
      if (filtered.length) return filtered;
    } catch {
      // Try the next sitemap.
    }
  }

  const feedCandidates = unique([
    source.feedUrl,
    await discoverFeedUrl(source.sourceUrl),
    ...commonUrls(source.sourceUrl, COMMON_FEED_PATHS),
  ]);

  for (const feedUrl of feedCandidates) {
    if (!feedUrl) continue;
    try {
      const urls = parseFeedPostUrls(await politeFetch(feedUrl), feedUrl);
      const filtered = filterPostUrls(urls, source.sourceUrl);
      if (filtered.length) return filtered;
    } catch {
      // Try the next discovery path.
    }
  }

  return filterPostUrls(await scrapeIndexLinks(source.sourceUrl), source.sourceUrl).slice(
    0,
    MAX_INDEX_LINKS,
  );
}

export function parseFeedPostUrls(feedXml: string, baseUrl: string): string[] {
  const urls: string[] = [];

  for (const item of feedXml.matchAll(/<item\b[\s\S]*?<\/item>/gi)) {
    const body = item[0];
    const link =
      matchFirst(body, /<link>([\s\S]*?)<\/link>/i) ??
      matchFirst(body, /<guid[^>]*isPermaLink=["']true["'][^>]*>([\s\S]*?)<\/guid>/i);
    if (link) urls.push(toAbsoluteUrl(decodeXml(link), baseUrl));
  }

  for (const entry of feedXml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)) {
    const body = entry[0];
    const link =
      matchFirst(body, /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i) ??
      matchFirst(body, /<link[^>]*href=["']([^"']+)["'][^>]*>/i) ??
      matchFirst(body, /<id>([\s\S]*?)<\/id>/i);
    if (link) urls.push(toAbsoluteUrl(decodeXml(link), baseUrl));
  }

  return unique(urls.filter(Boolean));
}

async function fetchGenericPost(url: string): Promise<Post> {
  const html = await politeFetch(url);
  const paragraphs = bestParagraphs(html);

  return {
    url,
    title: extractTitle(html, url),
    published: extractPublishedDate(html),
    paragraphs,
  };
}

async function discoverFeedUrl(sourceUrl: string): Promise<string | undefined> {
  try {
    const html = await politeFetch(sourceUrl);
    const links = extractLinks(html, sourceUrl);
    return links.find((url) => /\/(feed|rss|atom)(\.xml)?\/?$/i.test(new URL(url).pathname));
  } catch {
    return undefined;
  }
}

async function scrapeIndexLinks(sourceUrl: string): Promise<string[]> {
  const html = await politeFetch(sourceUrl);
  return extractLinks(html, sourceUrl);
}

function bestParagraphs(html: string): string[] {
  const candidates = [
    htmlToParagraphs(html, { withinSelector: "article" }),
    htmlToParagraphs(html, { withinSelector: "main" }),
    htmlToParagraphs(html, { withinSelector: "body" }),
    htmlToParagraphs(html),
  ];

  const best = candidates.find((items) => items.length >= 2) ?? [];
  return best
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length >= 40)
    .filter((paragraph) => !/subscribe/i.test(paragraph) || paragraph.length >= 220)
    .filter((paragraph) => !/^(subscribe|share|tweet|comments?|copyright)\b/i.test(paragraph));
}

function extractTitle(html: string, fallbackUrl: string): string {
  const raw =
    matchFirst(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    matchFirst(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ??
    new URL(fallbackUrl).pathname.split("/").filter(Boolean).pop() ??
    fallbackUrl;

  return decodeHtml(raw)
    .replace(/\s*[|-]\s*[^|-]{2,40}$/u, "")
    .trim();
}

function extractPublishedDate(html: string): string | null {
  const raw =
    matchFirst(html, /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    matchFirst(html, /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["'][^>]*>/i) ??
    matchFirst(html, /<time[^>]+datetime=["']([^"']+)["'][^>]*>/i);

  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function extractLinks(html: string, baseUrl: string): string[] {
  const urls = Array.from(html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>/gi))
    .map((match) => toAbsoluteUrl(decodeHtml(match[1]), baseUrl))
    .filter(Boolean);

  return unique(urls);
}

function filterPostUrls(urls: string[], sourceUrl: string): string[] {
  const source = new URL(sourceUrl);
  return unique(
    urls
      .map((url) => stripHash(url))
      .filter(Boolean)
      .filter((url) => {
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          return false;
        }
        if (parsed.host !== source.host && !sameParentDomain(parsed.host, source.host)) {
          return false;
        }
        if (/\.(xml|jpg|jpeg|png|gif|webp|svg|pdf|zip|mp3|mp4|mov)$/i.test(parsed.pathname)) {
          return false;
        }
        if (/(\/tag\/|\/tags\/|\/category\/|\/author\/|\/page\/|\/privacy|\/terms|\/about|\/contact|\/subscribe)/i.test(parsed.pathname)) {
          return false;
        }
        return parsed.pathname.length > 1;
      }),
  );
}

function commonUrls(sourceUrl: string, paths: string[]): string[] {
  const source = new URL(sourceUrl);
  return paths.map((path) => `${source.protocol}//${source.host}${path}`);
}

function sameParentDomain(hostA: string, hostB: string): boolean {
  const partsA = hostA.split(".").slice(-2).join(".");
  const partsB = hostB.split(".").slice(-2).join(".");
  return partsA === partsB;
}

function stripHash(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

function toAbsoluteUrl(url: string, baseUrl: string): string {
  const trimmed = url.trim();
  if (!trimmed || /^(mailto|tel|javascript):/i.test(trimmed)) return "";
  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return "";
  }
}

function matchFirst(text: string, pattern: RegExp): string | undefined {
  return text.match(pattern)?.[1]?.trim();
}

function unique<T>(items: ReadonlyArray<T | undefined | null>): T[] {
  return Array.from(new Set(items.filter((item): item is T => Boolean(item))));
}

function decodeHtml(text: string): string {
  return decodeXml(text).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_match, num: string) =>
      String.fromCodePoint(Number.parseInt(num, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * avc.com scraper (Fred Wilson).
 *
 * Standard WordPress with a sitemap at avc.com/sitemap.xml. Daily-blog
 * cadence since 2003 — the corpus is huge. For V1 we cap by year and start
 * with recent posts; the embedding pipeline is idempotent so we can expand
 * later via re-runs without duplicating work.
 *
 * TODO: verify the entry-content selector against a recent post.
 */

import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const SITEMAP = "https://avc.com/sitemap.xml";

export const fredWilsonScraper: BlogScraper = {
  authorSlug: "fred-wilson",
  authorName: "Fred Wilson",
  sitemapUrl: SITEMAP,

  async listPostUrls(): Promise<string[]> {
    const urls = await parseSitemap(SITEMAP);
    // AVC URLs look like /YYYY/MM/slug. Filter to that pattern.
    return urls.filter((u) => /\/\d{4}\/\d{2}\/[a-z0-9-]+/i.test(u));
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<meta\s+property="og:title"\s+content="([^"]+)"/i.exec(html);
    const title = (titleMatch?.[1] ?? extractTitle(html)).trim();

    const paragraphs = htmlToParagraphs(html, {
      withinSelector: "div.entry-content",
      tags: ["p", "blockquote", "li"],
    });

    return { url, title, published: extractPublishedDate(html), paragraphs };
  },
};

function extractTitle(html: string): string {
  const m = /<title>([^<]*)<\/title>/i.exec(html);
  return (m?.[1] ?? "Untitled").replace(/\s*[—|]\s*AVC.*$/i, "").trim();
}

function extractPublishedDate(html: string): string | null {
  const m = /<meta\s+property="article:published_time"\s+content="([^"]+)"/i.exec(html);
  if (!m) return null;
  try {
    return new Date(m[1]).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

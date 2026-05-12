/**
 * blog.samaltman.com scraper.
 *
 * Standard WordPress with a sitemap at /sitemap.xml. Sam writes occasional
 * essays of significant length.
 *
 * TODO: verify the entry-content selector.
 */

import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const SITEMAP = "https://blog.samaltman.com/sitemap.xml";

export const samAltmanScraper: BlogScraper = {
  authorSlug: "sam-altman",
  authorName: "Sam Altman",
  sitemapUrl: SITEMAP,

  async listPostUrls(): Promise<string[]> {
    const urls = await parseSitemap(SITEMAP);
    // WordPress index entries and category pages get filtered out by their
    // shape; we only keep post-style slugs.
    return urls.filter((u) => /\/posts\/|\/p\/|\/\d{4}\//i.test(u));
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
  return (m?.[1] ?? "Untitled").replace(/\s*[—|]\s*Sam Altman.*$/i, "").trim();
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

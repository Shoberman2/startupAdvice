/**
 * nav.al essay scraper. ESSAYS ONLY — explicitly excludes the tweet archive.
 *
 * Heuristic: Naval's site has an essays section at nav.al/category/essays/ and
 * an RSS feed at nav.al/feed/. We pull URLs from the RSS feed and filter to
 * paths that don't look like tweet/quote pages.
 *
 * TODO: verify selectors against actual post HTML before first scrape. The
 * content selector below is the default WordPress entry-content; nav.al may
 * use a custom theme.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const FEED_URL = "https://nav.al/feed/";

export const navalScraper: BlogScraper = {
  authorSlug: "naval",
  authorName: "Naval Ravikant",
  sitemapUrl: FEED_URL,

  async listPostUrls(): Promise<string[]> {
    const xml = await politeFetch(FEED_URL);
    const urls = new Set<string>();
    const re = /<link>([^<]+)<\/link>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const url = m[1].trim();
      // Skip the feed's own self-link and tweet-like single-line entries.
      if (url === "https://nav.al/" || url.includes("/category/") || url.includes("/tag/")) continue;
      urls.add(url);
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<title>([^<]*)<\/title>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/\s*[—|]\s*Naval.*$/i, "").trim();

    // WordPress default content area.
    const paragraphs = htmlToParagraphs(html, {
      withinSelector: "div.entry-content",
      tags: ["p", "blockquote", "li"],
    });

    return { url, title, published: extractPublishedDate(html), paragraphs };
  },
};

function extractPublishedDate(html: string): string | null {
  // WordPress emits <meta property="article:published_time" content="2024-01-15T...">.
  const m = /<meta\s+property="article:published_time"\s+content="([^"]+)"/i.exec(html);
  if (!m) return null;
  try {
    return new Date(m[1]).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

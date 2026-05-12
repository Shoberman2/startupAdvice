/**
 * world.hey.com/jason scraper.
 *
 * HEY World hosts Jason Fried's blog. It's a markdown-rendered, lightweight
 * blog with an RSS feed at world.hey.com/jason/feed.atom and clean semantic
 * HTML in each post.
 *
 * TODO: verify selectors against a recent post (HEY World theme has updated
 * over time).
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const FEED_URL = "https://world.hey.com/jason/feed.atom";

export const jasonFriedScraper: BlogScraper = {
  authorSlug: "jason-fried",
  authorName: "Jason Fried",
  sitemapUrl: FEED_URL,

  async listPostUrls(): Promise<string[]> {
    const xml = await politeFetch(FEED_URL);
    const urls = new Set<string>();
    const re = /<link[^>]+href="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const url = m[1];
      if (url.endsWith("/feed.atom") || url === "https://world.hey.com/jason") continue;
      if (url.startsWith("https://world.hey.com/jason/")) urls.add(url);
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();

    // HEY World wraps posts in <article>.
    const paragraphs = htmlToParagraphs(html, {
      withinSelector: "article",
      tags: ["p", "blockquote", "li"],
    });

    return { url, title, published: extractPublishedDate(html), paragraphs };
  },
};

function extractPublishedDate(html: string): string | null {
  const m = /<time[^>]+datetime="([^"]+)"/i.exec(html);
  if (!m) return null;
  try {
    return new Date(m[1]).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

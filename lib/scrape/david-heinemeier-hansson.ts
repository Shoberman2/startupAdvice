/**
 * world.hey.com/dhh scraper.
 *
 * HEY World hosts DHH's blog. Same platform and HTML conventions as
 * world.hey.com/jason — RSS at /feed.atom, posts wrapped in <article>.
 *
 * The Atom feed exposes the most recent ~25 posts; for the full archive a
 * second pass against the index page would be required. V1 takes the feed as
 * authoritative since DHH's recent writing covers the questions Founder Panel
 * is asked about.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const FEED_URL = "https://world.hey.com/dhh/feed.atom";

export const dhhScraper: BlogScraper = {
  authorSlug: "david-heinemeier-hansson",
  authorName: "David Heinemeier Hansson",
  sitemapUrl: FEED_URL,

  async listPostUrls(): Promise<string[]> {
    const xml = await politeFetch(FEED_URL);
    const urls = new Set<string>();
    const re = /<link[^>]+href="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const url = m[1];
      if (url.endsWith("/feed.atom") || url === "https://world.hey.com/dhh") continue;
      if (url.startsWith("https://world.hey.com/dhh/")) urls.add(url);
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();

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

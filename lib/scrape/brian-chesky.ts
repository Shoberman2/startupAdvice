/**
 * Brian Chesky scraper — Medium archive.
 *
 * Chesky doesn't run a personal blog. His public writing lives at
 * medium.com/@bchesky and is supplemented by Airbnb investor letters at
 * news.airbnb.com. V1 of this scraper targets the Medium archive only.
 *
 * Caveats:
 * - Medium often gates content behind anti-bot pages for unauthenticated
 *   requests. politeFetch with our UA gets cached HTML most of the time, but
 *   yields can be low. The pipeline is built to tolerate a small corpus.
 * - Medium's HTML changes; the article tag + <p> selector is stable enough
 *   for V1. Verify after a scrape run.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const ARCHIVE_URL = "https://medium.com/@bchesky";

export const brianCheskyScraper: BlogScraper = {
  authorSlug: "brian-chesky",
  authorName: "Brian Chesky",
  sitemapUrl: ARCHIVE_URL,

  async listPostUrls(): Promise<string[]> {
    const html = await politeFetch(ARCHIVE_URL);
    const urls = new Set<string>();
    // Medium post URLs look like /@bchesky/title-abc1234567 or /p/abc1234567.
    const re = /href="(https:\/\/medium\.com\/@bchesky\/[^"#?]+|\/@bchesky\/[^"#?]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1];
      const url = raw.startsWith("http") ? raw : `https://medium.com${raw}`;
      // Skip pagination / archive / about / followers.
      if (/\/(archive|about|followers|following|latest|has-recommended)\b/.test(url)) continue;
      if (url === ARCHIVE_URL || url === `${ARCHIVE_URL}/`) continue;
      urls.add(url.replace(/\?.*$/, ""));
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();

    const paragraphs = htmlToParagraphs(html, {
      withinSelector: "article",
      tags: ["p", "blockquote", "li", "h2"],
    });

    return { url, title, published: extractPublishedDate(html), paragraphs };
  },
};

function extractPublishedDate(html: string): string | null {
  // Medium emits a published time on <time datetime="..."> inside the article header.
  const m = /<time[^>]+datetime="([^"]+)"/i.exec(html);
  if (!m) return null;
  try {
    return new Date(m[1]).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

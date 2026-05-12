/**
 * paulgraham.com scraper.
 *
 * PG's site is bespoke 1990s-style HTML — no sitemap, no RSS, no semantic
 * tags. The post index lives at https://paulgraham.com/articles.html and is
 * a flat list of <a href="essay.html">Title</a>. Each essay is a single page
 * with a single <table> wrapping a long block of <font> tags containing the
 * body. We extract paragraphs by splitting on `<br><br>` boundaries within
 * the body block — the closest thing PG's HTML has to paragraph structure.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const INDEX_URL = "https://paulgraham.com/articles.html";
const BASE = "https://paulgraham.com";

export const paulGrahamScraper: BlogScraper = {
  authorSlug: "paul-graham",
  authorName: "Paul Graham",

  async listPostUrls(): Promise<string[]> {
    const html = await politeFetch(INDEX_URL);
    // <a href="essay.html">Title</a>
    const urls = new Set<string>();
    const re = /<a\s+href="([^"#?]+\.html)"/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      // Skip self-links and non-essay pages.
      if (
        href === "articles.html" ||
        href === "index.html" ||
        href.startsWith("http") ||
        href === "rss.html"
      ) {
        continue;
      }
      urls.add(href.startsWith("/") ? `${BASE}${href}` : `${BASE}/${href}`);
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);

    // Title: PG sets <title> on every essay.
    const titleMatch = /<title>([^<]*)<\/title>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").trim();

    // PG essays have no <p> tags. The body sits inside a tall <font size="2">
    // (or sometimes inside one large <td>). We normalize <br><br> to paragraph
    // breaks, then strip remaining HTML.
    const bodyMatch = /<font[^>]*size=["']?2["']?[^>]*>([\s\S]*?)<\/font>/i.exec(html);
    const bodySource = bodyMatch?.[1] ?? html;

    // Replace <br><br> (with optional whitespace) with paragraph boundary.
    const reparsed = `<html><body>${bodySource
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p><p>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")}</body></html>`;

    const paragraphs = htmlToParagraphs(reparsed, { tags: ["p"] });

    return {
      url,
      title,
      published: extractDate(html),
      paragraphs,
    };
  },
};

/** PG sometimes signs essays with a "Month YEAR" line at the top of the body. */
function extractDate(html: string): string | null {
  const m = /<font[^>]*>\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*<\/font>/i.exec(
    html,
  );
  if (!m) return null;
  try {
    const d = new Date(`${m[1]} 01`);
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

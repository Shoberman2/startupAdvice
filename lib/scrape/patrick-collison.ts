/**
 * patrickcollison.com essays scraper.
 *
 * Patrick's site is a custom static page with an essays index. He doesn't
 * publish frequently — the corpus is small but high-density. Essays are at
 * /essays.html or under specific paths like /fast.html, /advice.html.
 *
 * TODO: verify selectors and the essay-index pattern against the live site.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const BASE = "https://patrickcollison.com";
const INDEX_URL = `${BASE}/essays`;

export const patrickCollisonScraper: BlogScraper = {
  authorSlug: "patrick-collison",
  authorName: "Patrick Collison",

  async listPostUrls(): Promise<string[]> {
    const html = await politeFetch(INDEX_URL);
    const urls = new Set<string>();
    const re = /<a\s+href="([^"#?]+)"/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      if (href.startsWith("http") && !href.startsWith(BASE)) continue;
      if (href === "/" || href.endsWith("essays") || href.endsWith("/essays/")) continue;
      const abs = href.startsWith("http")
        ? href
        : `${BASE}${href.startsWith("/") ? "" : "/"}${href}`;
      // Heuristic: essay pages are at the root, e.g. /fast.html, /advice.html.
      if (/^https:\/\/patrickcollison\.com\/[a-z-]+(\.html)?$/.test(abs)) {
        urls.add(abs);
      }
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<title>([^<]*)<\/title>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").trim();

    // Patrick's essays don't have a standardized wrapper. Try a few selectors
    // in order, falling back to all <p> tags.
    let paragraphs = htmlToParagraphs(html, {
      withinSelector: "main",
      tags: ["p", "blockquote", "li"],
    });
    if (paragraphs.length === 0) {
      paragraphs = htmlToParagraphs(html, { tags: ["p", "blockquote", "li"] });
    }

    return { url, title, published: null, paragraphs };
  },
};

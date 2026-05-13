/**
 * tobi.lutke.com scraper.
 *
 * Tobi's personal site is sparse — a handful of essays and notes plus links
 * to interviews. We walk the homepage for outbound essay links, then fetch
 * each. The site has no sitemap and no RSS.
 *
 * Caveats:
 * - The corpus will be thin (single digits of posts). The pipeline is built
 *   to tolerate that.
 * - Tobi's Twitter is not in scope. Founder Panel only ingests long-form
 *   essayistic content the author would stand behind in a written record.
 */

import {
  htmlToParagraphs,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const HOMEPAGE = "https://tobi.lutke.com";
const HOST = "tobi.lutke.com";

export const tobiLutkeScraper: BlogScraper = {
  authorSlug: "tobi-lutke",
  authorName: "Tobi Lütke",
  sitemapUrl: "",

  async listPostUrls(): Promise<string[]> {
    const html = await politeFetch(HOMEPAGE);
    const urls = new Set<string>();
    const re = /href="([^"#?]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const href = m[1];
      // Resolve relative paths to the homepage host. Only keep links that
      // stay on tobi.lutke.com and look like essay paths (not /, /about,
      // /contact, /index).
      const absolute = href.startsWith("http")
        ? href
        : `https://${HOST}${href.startsWith("/") ? "" : "/"}${href}`;
      let url: URL;
      try {
        url = new URL(absolute);
      } catch {
        continue;
      }
      if (url.host !== HOST) continue;
      const path = url.pathname.replace(/\/$/, "");
      if (path === "" || /^\/(about|contact|index|home)$/i.test(path)) continue;
      urls.add(`${url.protocol}//${url.host}${path}`);
    }
    return [...urls];
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch =
      /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) ??
      /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();

    // Tobi's site has no consistent <article> wrapper across all pages.
    // Try <article> first, fall back to <main>, then fall back to the body.
    let paragraphs = htmlToParagraphs(html, {
      withinSelector: "article",
      tags: ["p", "blockquote", "li"],
    });
    if (paragraphs.length === 0) {
      paragraphs = htmlToParagraphs(html, {
        withinSelector: "main",
        tags: ["p", "blockquote", "li"],
      });
    }
    if (paragraphs.length === 0) {
      paragraphs = htmlToParagraphs(html, { tags: ["p", "blockquote", "li"] });
    }

    return { url, title, published: null, paragraphs };
  },
};

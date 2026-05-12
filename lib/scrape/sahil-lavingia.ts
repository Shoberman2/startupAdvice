/**
 * sahillavingia.com scraper.
 *
 * Sahil's blog is a custom static site (Hugo or similar). URLs follow
 * /posts/slug or /YYYY/MM/slug. We use a sitemap if present, otherwise scrape
 * the post index page.
 *
 * TODO: verify exact URL patterns and content selector against the live site.
 */

import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const SITEMAP = "https://sahillavingia.com/sitemap.xml";

export const sahilLavingiaScraper: BlogScraper = {
  authorSlug: "sahil-lavingia",
  authorName: "Sahil Lavingia",
  sitemapUrl: SITEMAP,

  async listPostUrls(): Promise<string[]> {
    try {
      const urls = await parseSitemap(SITEMAP);
      return urls.filter((u) => !u.endsWith("/") || /\/(posts|essays|writing)\//.test(u));
    } catch {
      // Sitemap not available — try the index page as a fallback.
      const html = await politeFetch("https://sahillavingia.com");
      const out = new Set<string>();
      const re = /href="([^"#?]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        const href = m[1];
        if (/\/(posts|essays|writing)\//.test(href)) {
          out.add(
            href.startsWith("http")
              ? href
              : `https://sahillavingia.com${href.startsWith("/") ? "" : "/"}${href}`,
          );
        }
      }
      return [...out];
    }
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();
    const paragraphs = htmlToParagraphs(html, {
      withinSelector: "article",
      tags: ["p", "blockquote", "li"],
    });
    return { url, title, published: null, paragraphs };
  },
};

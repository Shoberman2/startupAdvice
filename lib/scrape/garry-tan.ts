/**
 * garrytan.com scraper.
 *
 * Custom static site with an /essays or /posts index and a sitemap.
 *
 * TODO: verify the URL pattern and content selector against the live site.
 */

import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const SITEMAP = "https://garrytan.com/sitemap.xml";

export const garryTanScraper: BlogScraper = {
  authorSlug: "garry-tan",
  authorName: "Garry Tan",
  sitemapUrl: SITEMAP,

  async listPostUrls(): Promise<string[]> {
    try {
      const urls = await parseSitemap(SITEMAP);
      return urls.filter((u) => /\/(posts|essays|writing)\//.test(u));
    } catch {
      const html = await politeFetch("https://garrytan.com");
      const out = new Set<string>();
      const re = /href="([^"#?]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        if (/\/(posts|essays|writing)\//.test(m[1])) {
          out.add(
            m[1].startsWith("http") ? m[1] : `https://garrytan.com${m[1].startsWith("/") ? "" : "/"}${m[1]}`,
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

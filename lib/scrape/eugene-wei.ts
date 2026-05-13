/**
 * eugenewei.com scraper.
 *
 * Eugene's site is built on Squarespace. URLs look like
 * /blog/{slug}-{year}-{month}-{day} or /blog/{slug}. The site exposes a
 * sitemap at /sitemap.xml that lists every post.
 *
 * Squarespace serves the post body inside <main> wrapping <article>, with
 * paragraphs in <p> and pulled-quotes in <blockquote>.
 */

import {
  htmlToParagraphs,
  parseSitemap,
  politeFetch,
  type BlogScraper,
  type Post,
} from "./base";

const SITEMAP = "https://www.eugenewei.com/sitemap.xml";
const BLOG_PREFIX = "https://www.eugenewei.com/blog/";

export const eugeneWeiScraper: BlogScraper = {
  authorSlug: "eugene-wei",
  authorName: "Eugene Wei",
  sitemapUrl: SITEMAP,

  async listPostUrls(): Promise<string[]> {
    try {
      const urls = await parseSitemap(SITEMAP);
      return urls.filter((u) => u.startsWith(BLOG_PREFIX) && u !== BLOG_PREFIX);
    } catch {
      // Fallback: parse the blog index page.
      const html = await politeFetch("https://www.eugenewei.com/blog");
      const out = new Set<string>();
      const re = /href="([^"#?]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        const href = m[1];
        const url = href.startsWith("http") ? href : `https://www.eugenewei.com${href}`;
        if (url.startsWith(BLOG_PREFIX) && url !== BLOG_PREFIX) out.add(url);
      }
      return [...out];
    }
  },

  async fetchPost(url: string): Promise<Post> {
    const html = await politeFetch(url);
    const titleMatch =
      /<h1[^>]+entry-title[^>]*>([\s\S]*?)<\/h1>/i.exec(html) ??
      /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    const title = (titleMatch?.[1] ?? "Untitled").replace(/<[^>]+>/g, "").trim();

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

    return { url, title, published: extractPublishedDate(html), paragraphs };
  },
};

function extractPublishedDate(html: string): string | null {
  const m =
    /<time[^>]+datetime="([^"]+)"/i.exec(html) ??
    /<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i.exec(html);
  if (!m) return null;
  try {
    return new Date(m[1]).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

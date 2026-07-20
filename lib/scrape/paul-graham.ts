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

    const paragraphs = extractPaulGrahamParagraphs(html);

    return {
      url,
      title,
      published: extractDate(html),
      paragraphs,
    };
  },
};

/**
 * Extract an essay from Paul Graham's hand-authored HTML.
 *
 * Many pages nest a promotional <font size=2> inside the outer article font.
 * A non-greedy regex therefore stops after the promotion and loses the essay.
 * Match font tags with a depth counter, parse every size=2 candidate, and keep
 * the candidate with the most article text. This also handles newer essays
 * that nest colored footnote fonts inside the article.
 */
export function extractPaulGrahamParagraphs(html: string): string[] {
  const fontTag = /<\/?font\b[^>]*>/gi;
  const candidates: string[][] = [];
  let opening: RegExpExecArray | null;

  outer:
  while ((opening = fontTag.exec(html)) !== null) {
    if (opening[0].startsWith("</") || !/\bsize\s*=\s*(?:["']2["']|2)(?:\s|>)/i.test(opening[0])) {
      continue;
    }

    const bodyStart = fontTag.lastIndex;
    let depth = 1;
    let foundClosingTag = false;
    let closing: RegExpExecArray | null;
    while ((closing = fontTag.exec(html)) !== null) {
      depth += closing[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        candidates.push(paragraphsFromFontBody(html.slice(bodyStart, closing.index)));
        foundClosingTag = true;
        break;
      }
    }
    if (!foundClosingTag) {
      // RegExp#exec resets lastIndex after an unsuccessful global search. Stop
      // here instead of starting over forever on malformed legacy markup.
      candidates.push(paragraphsFromFontBody(html.slice(bodyStart)));
      break outer;
    }
  }

  const best = candidates.sort((a, b) => textLength(b) - textLength(a))[0];
  if (best?.length) return best;

  // A future redesign may use semantic paragraphs instead of font tags.
  return htmlToParagraphs(html, { tags: ["p", "blockquote", "li"] });
}

function paragraphsFromFontBody(body: string): string[] {
  const marker = "\n__PG_PARAGRAPH_BOUNDARY__\n";
  const marked = body
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<p\b[^>]*>|<\/p>/gi, marker)
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, marker)
    .replace(/<br\s*\/?>/gi, " ");

  return marked
    .split(marker)
    .map((part) => htmlToParagraphs(`<p>${part}</p>`, { tags: ["p"] })[0] ?? "")
    .map((part) => part.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((part) => !/^Want to start a startup\?/i.test(part))
    .filter((part) => !/^(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i.test(part));
}

function textLength(paragraphs: string[]): number {
  return paragraphs.reduce((total, paragraph) => total + paragraph.length, 0);
}

/** PG sometimes signs essays with a "Month YEAR" line at the top of the body. */
export function extractDate(html: string): string | null {
  const m = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/i.exec(html);
  if (!m) return null;
  try {
    const d = new Date(`${m[1]} 01`);
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

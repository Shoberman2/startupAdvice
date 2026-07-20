/**
 * Build local founder corpora for the /founder-conversation and /board-room
 * Claude Code skills.
 *
 * For each candidate founder, discovers posts via the existing scraper
 * registry (bespoke scraper when available, generic sitemap/feed discovery
 * otherwise), fetches up to --max-posts posts, and writes one markdown file
 * per substantive post to .claude/founders-corpus/<slug>/, plus INDEX.md.
 *
 * A founder "passes" when the corpus has >= MIN_POSTS substantive posts and
 * >= MIN_WORDS total words. Passing founders are listed in ROSTER.md; every
 * attempt is recorded in report.json so failures can be retried.
 *
 * URL-only indexes and the roster are versioned so a clean clone works with
 * WebFetch. Full-text research copies remain gitignored and local. Skill
 * answers always cite the canonical URLs.
 *
 * Usage:
 *   bun run scripts/build-founders-corpus.ts            # all candidates, skip done
 *   bun run scripts/build-founders-corpus.ts --only slug1,slug2 --force
 */

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkRobotsTxt, htmlToParagraphs, politeFetch, type Post } from "../lib/scrape/base";
import { scraperFor } from "../lib/scrape/index";
import { makeGenericScraper } from "../lib/scrape/generic";
import { FOUNDER_SOURCE_BY_SLUG } from "../data/founder-sources";

const ROOT = join(import.meta.dirname, "..");
const OUT_ROOT = join(ROOT, ".claude", "founders-corpus");
const GARRY_LEGACY = join(ROOT, ".claude", "skills", "garry", "corpus");

const MIN_POST_WORDS = 120;
/** Above this, a "post" is almost certainly an aggregate page or full book — skip it. */
const MAX_POST_WORDS = 15000;
const MIN_POSTS = 8;
const MIN_WORDS = 7500;
const MAX_CONSECUTIVE_FAILURES = 15;

/** Startup-advice-relevant candidates. Order is roster display order. */
const CANDIDATES = [
  "paul-graham", "naval", "jason-fried", "fred-wilson", "sahil-lavingia",
  "patrick-collison", "sam-altman", "garry-tan", "david-heinemeier-hansson",
  "brian-chesky", "tobi-lutke", "eugene-wei", "steve-blank", "eric-ries",
  "mark-suster", "dharmesh-shah", "joel-spolsky", "derek-sivers",
  "pieter-levels", "patrick-mckenzie", "andrew-chen", "elad-gil",
  "tomasz-tunguz", "brad-feld", "david-cummings", "matt-mullenweg",
  "jeff-atwood", "seth-godin", "chris-dixon", "hunter-walk", "jason-cohen",
  "rob-walling", "arvid-kahl", "david-skok", "brian-balfour", "matt-blumberg",
  "nir-eyal", "bill-gurley", "marc-andreessen", "balaji-srinivasan",
  "michael-seibel", "justin-kan", "andrew-wilkinson", "nathan-barry",
  "amy-hoy", "lenny-rachitsky", "julie-zhuo", "dan-shipper",
  "reid-hoffman", "ev-williams", "alexis-ohanian", "caterina-fake",
  "emmett-shear", "christina-cacioppo", "dalton-caldwell", "david-cancel",
  "ryan-hoover", "hiten-shah", "noah-kagan", "om-malik",
  "anne-laure-le-cunff", "john-onolan", "ben-casnocha", "jason-calacanis",
  "michael-arrington",
] as const;

/** Roster grouping shown by the founder pickers in the skills. */
const CATEGORY: Record<string, string> = {
  "paul-graham": "YC & scale founders", "sam-altman": "YC & scale founders",
  "garry-tan": "YC & scale founders", "michael-seibel": "YC & scale founders",
  "justin-kan": "YC & scale founders", "brian-chesky": "YC & scale founders",
  "patrick-collison": "YC & scale founders", "tobi-lutke": "YC & scale founders",
  "matt-mullenweg": "YC & scale founders",
  "reid-hoffman": "YC & scale founders", "ev-williams": "YC & scale founders",
  "alexis-ohanian": "YC & scale founders", "caterina-fake": "YC & scale founders",
  "emmett-shear": "YC & scale founders", "christina-cacioppo": "YC & scale founders",
  "dalton-caldwell": "YC & scale founders", "david-cancel": "YC & scale founders",
  "john-onolan": "Bootstrappers & indie", "noah-kagan": "Bootstrappers & indie",
  "anne-laure-le-cunff": "Bootstrappers & indie",
  "ben-casnocha": "Investors & VCs", "jason-calacanis": "Investors & VCs",
  "michael-arrington": "Investors & VCs", "om-malik": "Investors & VCs",
  naval: "Investors & VCs", "fred-wilson": "Investors & VCs",
  "mark-suster": "Investors & VCs", "brad-feld": "Investors & VCs",
  "elad-gil": "Investors & VCs", "chris-dixon": "Investors & VCs",
  "bill-gurley": "Investors & VCs", "marc-andreessen": "Investors & VCs",
  "tomasz-tunguz": "Investors & VCs", "hunter-walk": "Investors & VCs",
  "balaji-srinivasan": "Investors & VCs", "david-skok": "Investors & VCs",
  "jason-fried": "Bootstrappers & indie", "david-heinemeier-hansson": "Bootstrappers & indie",
  "sahil-lavingia": "Bootstrappers & indie", "derek-sivers": "Bootstrappers & indie",
  "pieter-levels": "Bootstrappers & indie", "rob-walling": "Bootstrappers & indie",
  "arvid-kahl": "Bootstrappers & indie", "amy-hoy": "Bootstrappers & indie",
  "jason-cohen": "Bootstrappers & indie", "andrew-wilkinson": "Bootstrappers & indie",
  "nathan-barry": "Bootstrappers & indie", "matt-blumberg": "Bootstrappers & indie",
  "david-cummings": "Bootstrappers & indie",
};
const DEFAULT_CATEGORY = "Product, growth & craft";
const CATEGORY_ORDER = [
  "YC & scale founders",
  "Product, growth & craft",
  "Bootstrappers & indie",
  "Investors & VCs",
] as const;
const CANDIDATE_ORDER = new Map<string, number>(CANDIDATES.map((slug, index) => [slug, index]));

interface FounderReport {
  slug: string;
  status: "pass" | "thin" | "robots_disallowed" | "error" | "skipped_existing";
  posts: number;
  words: number;
  note?: string;
}

function wordCount(paragraphs: string[]): number {
  return paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
}

function fileSlug(url: string): string {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  return (path.split("/").pop() || path || "post").slice(0, 80);
}

async function writeCorpus(slug: string, posts: Post[]): Promise<{ posts: number; words: number }> {
  const dir = join(OUT_ROOT, slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const seen = new Set<string>();
  const indexLines: string[] = [];
  let totalWords = 0;
  let written = 0;

  for (const post of posts) {
    const words = wordCount(post.paragraphs);
    if (words < MIN_POST_WORDS || words > MAX_POST_WORDS) continue;
    const base = `${post.published ?? "undated"}-${fileSlug(post.url)}`;
    if (seen.has(base)) continue;
    seen.add(base);

    const file = `${base}.md`;
    await writeFile(
      join(dir, file),
      [
        "---",
        `title: ${JSON.stringify(post.title)}`,
        `url: ${post.url}`,
        `published: ${post.published ?? "unknown"}`,
        "---",
        "",
        ...post.paragraphs.flatMap((p) => [p, ""]),
      ].join("\n"),
    );
    indexLines.push(`- ${post.published ?? "undated"} — [${post.title}](${post.url}) — \`${file}\` — ${words}w`);
    totalWords += words;
    written++;
  }

  indexLines.sort().reverse();
  const meta = FOUNDER_SOURCE_BY_SLUG.get(slug);
  await writeFile(
    join(dir, "INDEX.md"),
    [
      `# ${meta?.name ?? slug} corpus index`,
      "",
      `Source: ${meta?.sourceUrl ?? "unknown"} — fetched ${new Date().toISOString().slice(0, 10)}`,
      `${written} posts, ${totalWords} words. Format: date — [title](canonical url) — \`file\` — words.`,
      "",
      ...indexLines,
      "",
    ].join("\n"),
  );

  return { posts: written, words: totalWords };
}

async function migrateGarry(): Promise<FounderReport> {
  const dir = join(OUT_ROOT, "garry-tan");
  try {
    await stat(join(dir, "INDEX.md"));
    // Already in place (build-garry-corpus.ts now writes here directly).
  } catch {
    try {
      await stat(join(GARRY_LEGACY, "INDEX.md"));
      await rm(dir, { recursive: true, force: true });
      await cp(GARRY_LEGACY, dir, { recursive: true });
    } catch {
      return { slug: "garry-tan", status: "error", posts: 0, words: 0, note: "corpus missing; run build-garry-corpus.ts" };
    }
  }
  const files = (await readdir(dir)).filter((f) => f !== "INDEX.md" && f.endsWith(".md"));
  const index = await readFile(join(dir, "INDEX.md"), "utf8");
  const stats = /^(\d+) posts, (\d+) words\./m.exec(index);
  let words = Number(stats?.[2] ?? 0);
  if (!stats) {
    for (const f of files) {
      const source = await readFile(join(dir, f), "utf8");
      const body = /^---\n[\s\S]*?\n---\n([\s\S]*)$/m.exec(source)?.[1] ?? "";
      words += body.trim() ? body.trim().split(/\s+/).length : 0;
    }
  }
  return {
    slug: "garry-tan",
    status: files.length >= MIN_POSTS && words >= MIN_WORDS ? "pass" : "thin",
    posts: files.length,
    words,
  };
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * If `home` hosts a Posthaven blog, walk its paginated Atom feed and return
 * full posts (refetching the page for entries truncated at the fold).
 * Returns null when the site is not Posthaven.
 */
async function posthavenPosts(home: string, maxPosts: number): Promise<Post[] | null> {
  // Keep any path component (world.hey.com/jason must not become world.hey.com).
  const feedUrl = `${home.replace(/\/$/, "")}/posts.atom`;
  let firstPage: string;
  try {
    firstPage = await politeFetch(feedUrl);
  } catch {
    return null;
  }
  if (!/<feed[\s>]/i.test(firstPage) || !/posthaven|<entry>/i.test(firstPage)) return null;

  const posts: Post[] = [];
  for (let page = 1; posts.length < maxPosts && page <= 40; page++) {
    const xml = page === 1 ? firstPage : await politeFetch(`${feedUrl}?page=${page}`).catch(() => "");
    const entries = xml.split("<entry>").slice(1);
    if (entries.length === 0) break;
    for (const raw of entries) {
      if (posts.length >= maxPosts) break;
      const entry = raw.split("</entry>")[0];
      const url = /<link rel="alternate"[^>]*href="([^"]+)"/.exec(entry)?.[1];
      if (!url) continue;
      const title = decodeXmlEntities(/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1] ?? "Untitled").trim();
      const published = /<published>([^<]+)<\/published>/.exec(entry)?.[1]?.slice(0, 10) ?? null;
      const contentRaw = /<content type="html">([\s\S]*?)<\/content>/.exec(entry)?.[1] ?? "";
      let paragraphs = extractContentParagraphs(decodeXmlEntities(contentRaw));
      const truncated = /Read more<\/a>/i.test(decodeXmlEntities(contentRaw));
      while (paragraphs.length && /^Read more$/i.test(paragraphs[paragraphs.length - 1])) paragraphs.pop();
      if (truncated) {
        try {
          const html = await politeFetch(url);
          const full = htmlToParagraphs(html, {
            withinSelector: "div.post-body",
            tags: ["p", "blockquote", "li", "h2", "h3"],
          });
          if (full.length > paragraphs.length) paragraphs = full;
        } catch {
          // Keep the feed excerpt.
        }
      }
      posts.push({ url, title, published, paragraphs });
    }
  }
  return posts;
}

/**
 * Extraction fallback for editor markup that carries text in <div>/<br>
 * instead of <p> (HEY World's Trix output, some Medium exports).
 */
function fallbackParagraphs(html: string): string[] {
  return html
    .replace(/<(br|\/div|\/p|\/h[1-6]|\/li|\/blockquote)[^>]*>/gi, "\n")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\n+/)
    .map((s) => decodeXmlEntities(s).replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 40);
}

function extractContentParagraphs(decodedHtml: string): string[] {
  const paragraphs = htmlToParagraphs(decodedHtml, { tags: ["p", "blockquote", "li", "h2", "h3"] });
  return paragraphs.length >= 2 ? paragraphs : fallbackParagraphs(decodedHtml);
}

function substantiveStats(posts: Post[]): { posts: number; words: number } {
  let count = 0;
  let words = 0;
  for (const p of posts) {
    const w = wordCount(p.paragraphs);
    if (w >= MIN_POST_WORDS && w <= MAX_POST_WORDS) {
      count++;
      words += w;
    }
  }
  return { posts: count, words };
}

function passes(stats: { posts: number; words: number }): boolean {
  return stats.posts >= MIN_POSTS && stats.words >= MIN_WORDS;
}

/** Walk the WordPress REST API — the cleanest source when a site is WP. */
async function wpRestPosts(home: string, maxPosts: number): Promise<Post[] | null> {
  const origin = new URL(home).origin;
  const posts: Post[] = [];
  for (let page = 1; posts.length < maxPosts && page <= 20; page++) {
    let body: string;
    try {
      body = await politeFetch(`${origin}/wp-json/wp/v2/posts?per_page=50&page=${page}`);
    } catch {
      break;
    }
    let items: { link?: string; date?: string; title?: { rendered?: string }; content?: { rendered?: string } }[];
    try {
      items = JSON.parse(body);
      if (!Array.isArray(items)) return posts.length ? posts : null;
    } catch {
      return posts.length ? posts : null;
    }
    if (items.length === 0) break;
    for (const item of items) {
      if (posts.length >= maxPosts || !item.link) continue;
      posts.push({
        url: item.link,
        title: decodeXmlEntities(item.title?.rendered ?? "Untitled").replace(/<[^>]+>/g, "").trim(),
        published: item.date?.slice(0, 10) ?? null,
        paragraphs: extractContentParagraphs(item.content?.rendered ?? ""),
      });
    }
  }
  return posts.length ? posts : null;
}

/** Walk an Atom feed that paginates via <link rel="next"> (HEY World). */
async function atomWalkPosts(home: string, maxPosts: number): Promise<Post[] | null> {
  let feedUrl = `${home.replace(/\/$/, "")}/feed.atom`;
  const posts: Post[] = [];
  for (let page = 0; posts.length < maxPosts && page < 20 && feedUrl; page++) {
    let xml: string;
    try {
      xml = await politeFetch(feedUrl);
    } catch {
      break;
    }
    if (!/<feed[\s>]/i.test(xml)) break;
    const entries = xml.split(/<entry\b[^>]*>/).slice(1);
    if (entries.length === 0) break;
    for (const raw of entries) {
      if (posts.length >= maxPosts) break;
      const entry = raw.split("</entry>")[0];
      const url =
        /<link[^>]*rel="alternate"[^>]*href="([^"]+)"/.exec(entry)?.[1] ??
        /<link[^>]*href="([^"]+)"[^>]*rel="alternate"/.exec(entry)?.[1];
      if (!url) continue;
      const title = decodeXmlEntities(/<title[^>]*>([\s\S]*?)<\/title>/.exec(entry)?.[1] ?? "Untitled").trim();
      const published = (/<published>([^<]+)<\/published>/.exec(entry)?.[1] ?? /<updated>([^<]+)<\/updated>/.exec(entry)?.[1])?.slice(0, 10) ?? null;
      const contentRaw = /<content[^>]*>([\s\S]*?)<\/content>/.exec(entry)?.[1] ?? "";
      posts.push({
        url, title, published,
        paragraphs: extractContentParagraphs(decodeXmlEntities(contentRaw)),
      });
    }
    feedUrl = /<link[^>]*rel="next"[^>]*href="([^"]+)"/.exec(xml)?.[1]?.replace(/&amp;/g, "&") ?? "";
  }
  return posts.length ? posts : null;
}

/** Last resort: a plain RSS feed whose items carry full content:encoded (Medium). */
async function rssContentPosts(home: string): Promise<Post[] | null> {
  const origin = new URL(home);
  const candidates = origin.host === "medium.com"
    ? [`https://medium.com/feed/${origin.pathname.split("/").filter(Boolean)[0] ?? ""}`]
    : [`${home.replace(/\/$/, "")}/feed`, `${origin.origin}/feed`, `${origin.origin}/rss`];
  for (const feedUrl of candidates) {
    let xml: string;
    try {
      xml = await politeFetch(feedUrl);
    } catch {
      continue;
    }
    const items = xml.split(/<item\b[^>]*>/).slice(1);
    if (!items.length) continue;
    const posts: Post[] = [];
    for (const raw of items) {
      const item = raw.split("</item>")[0];
      const url = /<link>([\s\S]*?)<\/link>/.exec(item)?.[1]?.trim();
      const content = /<content:encoded>([\s\S]*?)<\/content:encoded>/.exec(item)?.[1] ?? "";
      if (!url || !content) continue;
      posts.push({
        url: decodeXmlEntities(url).split("?")[0],
        title: decodeXmlEntities(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? "Untitled").replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        published: (() => { const d = /<pubDate>([^<]+)<\/pubDate>/.exec(item)?.[1]; const t = d ? new Date(d) : null; return t && !Number.isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : null; })(),
        paragraphs: extractContentParagraphs(decodeXmlEntities(content)),
      });
    }
    if (posts.length) return posts;
  }
  return null;
}

async function buildFounder(slug: string, maxPosts: number, force: boolean): Promise<FounderReport> {
  if (slug === "garry-tan") return migrateGarry();

  if (!force) {
    try {
      await stat(join(OUT_ROOT, slug, "INDEX.md"));
      const body = await readFile(join(OUT_ROOT, slug, "INDEX.md"), "utf8");
      const posts = Number(/^(\d+) posts, (\d+) words/m.exec(body)?.[1] ?? 0);
      const words = Number(/^(\d+) posts, (\d+) words/m.exec(body)?.[2] ?? 0);
      return { slug, status: "skipped_existing", posts, words };
    } catch {
      // Not built yet — proceed.
    }
  }

  const scraper = scraperFor(slug);
  if (!scraper) return { slug, status: "error", posts: 0, words: 0, note: "no scraper" };

  const source = FOUNDER_SOURCE_BY_SLUG.get(slug);
  const home = scraper.homeUrl ?? source?.sourceUrl;
  if (home && !(await checkRobotsTxt(home))) {
    return { slug, status: "robots_disallowed", posts: 0, words: 0 };
  }

  // Strategy chain: feed/API strategies first (cheap, full content), the
  // scraper page-fetch path when those fall short, RSS-content as last resort.
  // Keep whichever result grounds the most substantive words.
  let best: Post[] = [];
  let bestNote = "";
  const consider = (posts: Post[] | null, note: string): boolean => {
    if (!posts) return false;
    if (substantiveStats(posts).words > substantiveStats(best).words) {
      best = posts;
      bestNote = note;
    }
    return passes(substantiveStats(best));
  };

  if (home) {
    const done =
      consider(await posthavenPosts(home, maxPosts).catch(() => null), "posthaven feed") ||
      consider(await wpRestPosts(home, maxPosts).catch(() => null), "wp rest api") ||
      consider(await atomWalkPosts(home, maxPosts).catch(() => null), "atom walk");
    if (!done) {
      // Page-fetch path via bespoke scraper, generic discovery as fallback.
      let urls: string[] = [];
      try {
        urls = (await scraper.listPostUrls()).slice(0, maxPosts);
      } catch {
        // Fall through to generic.
      }
      if (urls.length === 0 && source) {
        try {
          urls = (await makeGenericScraper(source).listPostUrls()).slice(0, maxPosts);
        } catch {
          // Fall through.
        }
      }
      const posts: Post[] = [];
      let consecutiveFailures = 0;
      for (const url of urls) {
        try {
          posts.push(await scraper.fetchPost(url));
          consecutiveFailures = 0;
        } catch {
          if (++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) break;
        }
      }
      consider(posts, "page fetch") || consider(await rssContentPosts(home).catch(() => null), "rss content");
    }
  }

  if (best.length === 0) {
    return { slug, status: "error", posts: 0, words: 0, note: "no strategy produced posts" };
  }
  const { posts: written, words } = await writeCorpus(slug, best);
  const status = written >= MIN_POSTS && words >= MIN_WORDS ? "pass" : "thin";
  return { slug, status, posts: written, words, note: bestNote };
}

async function writeRosterAndReport(reports: FounderReport[]) {
  const orderedReports = [...reports].sort(
    (a, b) => (CANDIDATE_ORDER.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (CANDIDATE_ORDER.get(b.slug) ?? Number.MAX_SAFE_INTEGER)
      || a.slug.localeCompare(b.slug),
  );
  await writeFile(join(OUT_ROOT, "report.json"), JSON.stringify(orderedReports, null, 2));

  // Judge by stats, not stored status — thresholds may have changed since a report was written.
  const passing = orderedReports.filter((r) => r.posts >= MIN_POSTS && r.words >= MIN_WORDS);
  const byCategory = new Map<string, FounderReport[]>();
  for (const r of passing) {
    const cat = CATEGORY[r.slug] ?? DEFAULT_CATEGORY;
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), r]);
  }
  const sections: string[] = [];
  for (const cat of CATEGORY_ORDER) {
    const members = byCategory.get(cat) ?? [];
    if (!members.length) continue;
    sections.push(`## ${cat}`, "", "| # | Name | Company | Posts | Words | Slug |", "|---|---|---|---|---|---|");
    for (const r of members) {
      const m = FOUNDER_SOURCE_BY_SLUG.get(r.slug);
      sections.push(`| | ${m?.name ?? r.slug} | ${m?.company ?? ""} | ${r.posts} | ${Math.round(r.words / 1000)}k | \`${r.slug}\` |`);
    }
    sections.push("");
  }
  // Number the roster rows globally so users can pick by number.
  let n = 0;
  const numbered = sections.map((line) => (line.startsWith("| |") ? line.replace("| |", `| ${++n} |`) : line));
  await writeFile(
    join(OUT_ROOT, "ROSTER.md"),
    [
      "# Founder roster",
      "",
      `${passing.length} founders with working corpora. Generated ${new Date().toISOString().slice(0, 10)} by scripts/build-founders-corpus.ts.`,
      "Each founder ships with a URL-only `INDEX.md`; optional local post files are generated by `bun run founders:corpus`.",
      "",
      ...numbered,
    ].join("\n"),
  );
  return passing.length;
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.indexOf("--only");
  const maxPostsArg = args.indexOf("--max-posts");
  const concurrencyArg = args.indexOf("--concurrency");
  const force = args.includes("--force");

  const slugs = onlyArg > -1 ? args[onlyArg + 1].split(",") : [...CANDIDATES];
  const maxPosts = maxPostsArg > -1 ? Number(args[maxPostsArg + 1]) : 100;
  const concurrency = concurrencyArg > -1 ? Number(args[concurrencyArg + 1]) : 6;

  await mkdir(OUT_ROOT, { recursive: true });

  const queue = [...slugs];
  const reports: FounderReport[] = [];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const slug = queue.shift();
      if (!slug) break;
      const started = Date.now();
      const report = await buildFounder(slug, maxPosts, force).catch(
        (e): FounderReport => ({ slug, status: "error", posts: 0, words: 0, note: (e as Error).message }),
      );
      reports.push(report);
      console.log(
        `[${reports.length}/${slugs.length}] ${slug}: ${report.status} — ${report.posts} posts, ${report.words} words (${Math.round((Date.now() - started) / 1000)}s)${report.note ? ` — ${report.note}` : ""}`,
      );
    }
  });
  await Promise.all(workers);

  // Merge with any prior report so --only reruns don't drop other founders.
  let merged = reports;
  try {
    const prior: FounderReport[] = JSON.parse(await readFile(join(OUT_ROOT, "report.json"), "utf8"));
    const fresh = new Set(reports.map((r) => r.slug));
    merged = [...prior.filter((r) => !fresh.has(r.slug)), ...reports];
  } catch {
    // No prior report.
  }
  const passing = await writeRosterAndReport(merged);
  console.log(`\nDone. ${passing} founders passing. Roster: ${join(OUT_ROOT, "ROSTER.md")}`);
}

main();

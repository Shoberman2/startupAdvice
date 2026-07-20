/**
 * Offline integrity check for /founder-conversation and /board-room.
 *
 * This intentionally makes no network or model calls. It verifies that Claude
 * can discover both skills, every roster choice resolves to a substantive local
 * corpus, and the generated roster/report agree with the files on disk.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { FOUNDER_SOURCE_BY_SLUG } from "../data/founder-sources";

const ROOT = join(import.meta.dirname, "..");
const CORPUS_ROOT = join(ROOT, ".claude", "founders-corpus");
const MIN_FOUNDERS = 30;
const MIN_POSTS = 8;
const MIN_WORDS = 7_500;
const MIN_POST_WORDS = 120;
const MAX_POST_WORDS = 15_000;

interface RosterMember {
  number: number;
  name: string;
  company: string;
  posts: number;
  wordsLabel: string;
  slug: string;
}

interface IndexEntry {
  url: string;
  words: number;
}

const failures: string[] = [];
const warnings: string[] = [];

function check(condition: unknown, message: string): asserts condition {
  if (!condition) failures.push(message);
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function validateSkill(directory: string, requiredPhrases: string[]): Promise<void> {
  const path = join(ROOT, ".claude", "skills", directory, "SKILL.md");
  check(await pathExists(path), `${directory}: missing SKILL.md`);
  if (!(await pathExists(path))) return;

  const source = await readFile(path, "utf8");
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(source)?.[1] ?? "";
  const declaredName = /^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
  check(declaredName === directory, `${directory}: frontmatter name must match its directory`);
  check(/^description:\s*\S+/m.test(frontmatter), `${directory}: missing description`);
  check(/^argument-hint:\s*\S+/m.test(frontmatter), `${directory}: missing argument-hint`);
  check(source.split("\n").length <= 500, `${directory}: SKILL.md exceeds the 500-line guidance`);

  for (const phrase of requiredPhrases) {
    check(source.includes(phrase), `${directory}: missing required contract phrase ${JSON.stringify(phrase)}`);
  }
}

function parseRoster(source: string): RosterMember[] {
  const rows: RosterMember[] = [];
  const rowPattern = /^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|$/gm;
  for (const match of source.matchAll(rowPattern)) {
    rows.push({
      number: Number(match[1]),
      name: match[2].trim(),
      company: match[3].trim(),
      posts: Number(match[4]),
      wordsLabel: match[5].trim(),
      slug: match[6].trim(),
    });
  }
  return rows;
}

function balancedGroupSizes(memberCount: number): number[] {
  if (memberCount <= 4) return [memberCount];
  const groupCount = Math.ceil(memberCount / 4);
  const baseSize = Math.floor(memberCount / groupCount);
  const largerGroups = memberCount % groupCount;
  return Array.from({ length: groupCount }, (_, index) => baseSize + (index < largerGroups ? 1 : 0));
}

function parsePost(source: string): { body: string; url: string | null } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/m.exec(source);
  if (!match) return { body: "", url: null };
  const url = /^url:\s*(https?:\/\/\S+)\s*$/m.exec(match[1])?.[1] ?? null;
  return { body: match[2], url };
}

function parseIndexEntries(source: string): IndexEntry[] {
  return [...source.matchAll(/^- .+?— \[.*\]\((https?:\/\/.*)\) — `[^`]+` — (\d+)w$/gm)].map((match) => ({
    url: match[1],
    words: Number(match[2]),
  }));
}

async function main(): Promise<void> {
  const metadataOnly = process.argv.includes("--metadata-only");
  await validateSkill("founder-conversation", [
    "$ARGUMENTS",
    "ROSTER.md",
    "AskUserQuestion",
    "balanced",
    "ideas/*.md",
    "Founder feedback log",
    "${CLAUDE_SESSION_ID}",
    "WebFetch",
    "Do not imitate",
    "no affiliation or endorsement",
    "10–25",
  ]);
  await validateSkill("board-room", [
    "$ARGUMENTS",
    "ROSTER.md",
    "AskUserQuestion",
    "multiSelect: true",
    "balanced",
    "2–5",
    "ideas/*.md",
    "Founder feedback log",
    "${CLAUDE_SESSION_ID}",
    "WebFetch",
    "do not imitate",
    "no affiliation or endorsement",
    "10–25",
  ]);

  check(!(await pathExists(join(ROOT, ".claude", "skills", "garry"))), "retired .claude/skills/garry still exists");

  const rosterPath = join(CORPUS_ROOT, "ROSTER.md");
  check(await pathExists(rosterPath), "ROSTER.md is missing; run `bun run founders:corpus`");
  if (!(await pathExists(rosterPath))) throw new Error(failures.join("\n"));

  const rosterSource = await readFile(rosterPath, "utf8");
  const members = parseRoster(rosterSource);
  const declaredCount = Number(/^(\d+) founders with working corpora\./m.exec(rosterSource)?.[1] ?? 0);
  check(members.length >= MIN_FOUNDERS, `roster has ${members.length} founders; expected at least ${MIN_FOUNDERS}`);
  check(declaredCount === members.length, `roster declares ${declaredCount} founders but contains ${members.length} rows`);
  check(members.every((member, index) => member.number === index + 1), "roster numbers are not sequential");
  check(new Set(members.map((member) => member.slug)).size === members.length, "roster contains duplicate slugs");
  check(new Set(members.map((member) => member.name)).size === members.length, "roster contains duplicate names");

  const categoryHeadings = [...rosterSource.matchAll(/^## ([^\n]+)$/gm)];
  const categorySections = categoryHeadings.map((heading, index) => ({
    name: heading[1],
    body: rosterSource.slice(
      (heading.index ?? 0) + heading[0].length,
      categoryHeadings[index + 1]?.index ?? rosterSource.length,
    ),
  }));
  check(categorySections.length === 4, `picker requires exactly four roster categories; found ${categorySections.length}`);
  for (const category of categorySections) {
    const categoryMembers = parseRoster(category.body);
    const groups = balancedGroupSizes(categoryMembers.length);
    check(categoryMembers.length > 0, `${category.name}: empty roster category`);
    check(groups.length <= 4, `${category.name}: needs ${groups.length} group choices, above AskUserQuestion's limit`);
    check(groups.every((size) => size >= 2 && size <= 4), `${category.name}: cannot partition into selectable groups (sizes ${groups.join(", ")})`);
    check(groups.reduce((sum, size) => sum + size, 0) === categoryMembers.length, `${category.name}: picker groups do not cover every member`);
  }

  const reportPath = join(CORPUS_ROOT, "report.json");
  const report = !metadataOnly && await pathExists(reportPath)
    ? JSON.parse(await readFile(reportPath, "utf8")) as Array<{ slug: string; posts: number; words: number }>
    : [];
  const reportBySlug = new Map(report.map((entry) => [entry.slug, entry]));

  let totalPosts = 0;
  for (const member of members) {
    check(FOUNDER_SOURCE_BY_SLUG.has(member.slug), `${member.slug}: missing source registry metadata`);
    const directory = join(CORPUS_ROOT, member.slug);
    const indexPath = join(directory, "INDEX.md");
    check(await pathExists(indexPath), `${member.slug}: missing INDEX.md`);
    if (!(await pathExists(indexPath))) continue;

    const indexSource = await readFile(indexPath, "utf8");
    const standardStats = /^(\d+) posts, (\d+) words\./m.exec(indexSource);
    const legacyPostCount = Number(/^(\d+) essays\./m.exec(indexSource)?.[1] ?? 0);
    const indexPosts = Number(standardStats?.[1] ?? legacyPostCount);
    const indexWords = Number(standardStats?.[2] ?? 0);
    const indexEntries = parseIndexEntries(indexSource);
    const files = (await readdir(directory)).filter((file) => file.endsWith(".md") && file !== "INDEX.md");

    check(indexEntries.length === indexPosts, `${member.slug}: INDEX says ${indexPosts} posts but contains ${indexEntries.length} source rows`);
    check(indexEntries.every((entry) => entry.url.startsWith("https://")), `${member.slug}: INDEX contains a non-HTTPS canonical URL`);
    check(indexEntries.every((entry) => entry.words <= MAX_POST_WORDS), `${member.slug}: INDEX contains an entry above the safety cap`);
    check(member.posts === indexPosts, `${member.slug}: roster says ${member.posts} posts but INDEX says ${indexPosts}`);

    let computedWords = 0;
    let substantivePosts = 0;
    let substantiveWords = 0;
    if (metadataOnly || files.length === 0) {
      computedWords = indexEntries.reduce((sum, entry) => sum + entry.words, 0);
      substantivePosts = indexEntries.filter((entry) => entry.words >= MIN_POST_WORDS).length;
      substantiveWords = indexEntries.reduce(
        (sum, entry) => sum + (entry.words >= MIN_POST_WORDS ? entry.words : 0),
        0,
      );
    } else {
      check(files.length === indexPosts, `${member.slug}: INDEX says ${indexPosts} posts but disk has ${files.length}`);
      for (const file of files) {
        const source = await readFile(join(directory, file), "utf8");
        const { body, url } = parsePost(source);
        const words = wordCount(body);
        check(Boolean(url), `${member.slug}/${file}: missing canonical http(s) URL`);
        check(words <= MAX_POST_WORDS, `${member.slug}/${file}: ${words} body words exceeds safety cap`);
        computedWords += words;
        if (words >= MIN_POST_WORDS) {
          substantivePosts++;
          substantiveWords += words;
        }
      }
    }

    check(indexWords === computedWords, `${member.slug}: INDEX says ${indexWords} words but source rows total ${computedWords}`);
    check(substantivePosts >= MIN_POSTS, `${member.slug}: only ${substantivePosts} substantive posts`);
    check(substantiveWords >= MIN_WORDS, `${member.slug}: only ${substantiveWords} substantive words`);

    const reportEntry = reportBySlug.get(member.slug);
    if (report.length && reportEntry) {
      check(reportEntry.posts === indexPosts, `${member.slug}: report says ${reportEntry.posts} posts but INDEX says ${indexPosts}`);
      check(reportEntry.words === indexWords, `${member.slug}: report says ${reportEntry.words} words but INDEX says ${indexWords}`);
    } else if (report.length) {
      check(false, `${member.slug}: missing report.json entry`);
    }

    totalPosts += indexPosts;
  }

  const paulIndex = await readFile(join(CORPUS_ROOT, "paul-graham", "INDEX.md"), "utf8");
  for (const classic of ["ds.html", "ramenprofitable.html", "startupideas.html", "growth.html", "wealth.html"]) {
    check(paulIndex.includes(`https://paulgraham.com/${classic}`), `paul-graham: classic essay ${classic} is missing`);
  }

  if (warnings.length) {
    console.warn(`\nWarnings (${warnings.length}):`);
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
  if (failures.length) {
    console.error(`\nFounder skill validation failed (${failures.length}):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Founder skills valid: 2 skills, ${members.length} founders, ${totalPosts} source posts.`);
}

await main();

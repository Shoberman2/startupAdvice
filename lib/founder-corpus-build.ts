import type { RosterMember } from "./roster";

export interface FounderReport {
  slug: string;
  status: "pass" | "thin" | "robots_disallowed" | "error" | "skipped_existing";
  posts: number;
  words: number;
  note?: string;
}

export function collectOnlySlugs(args: string[]): string[] {
  const slugs: string[] = [];

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    let value: string | undefined;

    if (arg === "--only") {
      value = args[++index];
      if (!value || value.startsWith("--")) {
        throw new Error("--only requires one or more comma-separated founder slugs");
      }
    } else if (arg.startsWith("--only=")) {
      value = arg.slice("--only=".length);
    } else {
      continue;
    }

    const values = value.split(",").map((slug) => slug.trim()).filter(Boolean);
    if (!values.length) {
      throw new Error("--only requires one or more comma-separated founder slugs");
    }
    slugs.push(...values);
  }

  return [...new Set(slugs)];
}

export function corpusIndexStats(source: string): { posts: number; words: number } | null {
  const match = /^(\d+) posts, (\d+) words\./m.exec(source);
  return match ? { posts: Number(match[1]), words: Number(match[2]) } : null;
}

export function reportsFromRoster(members: RosterMember[]): FounderReport[] {
  return members.map((member) => ({
    slug: member.slug,
    status: "pass",
    posts: member.posts,
    words: member.wordsK * 1000,
    note: "preserved from committed roster",
  }));
}

export function mergeFounderReports({
  roster,
  prior,
  fresh,
}: {
  roster: FounderReport[];
  prior: FounderReport[];
  fresh: FounderReport[];
}): FounderReport[] {
  const bySlug = new Map<string, FounderReport>();

  for (const reports of [roster, prior, fresh]) {
    for (const report of reports) bySlug.set(report.slug, report);
  }

  return [...bySlug.values()];
}

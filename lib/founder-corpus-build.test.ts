import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parseRoster } from "./roster";
import {
  collectOnlySlugs,
  corpusIndexStats,
  mergeFounderReports,
  reportsFromRoster,
  type FounderReport,
} from "./founder-corpus-build";

describe("founder corpus partial rebuilds", () => {
  test("collects every repeated --only value", () => {
    expect(
      collectOnlySlugs([
        "--only",
        "naval",
        "--only",
        "garry-tan",
        "--only",
        "patrick-collison",
      ]),
    ).toEqual(["naval", "garry-tan", "patrick-collison"]);
  });

  test("uses committed index metadata when local post files are absent", () => {
    const index = readFileSync(
      join(import.meta.dirname, "..", ".claude", "founders-corpus", "garry-tan", "INDEX.md"),
      "utf8",
    );

    expect(corpusIndexStats(index)).toEqual({ posts: 223, words: 118_734 });
  });

  test("preserves the committed roster when report.json is absent", () => {
    const roster = parseRoster(
      readFileSync(join(import.meta.dirname, "..", ".claude", "founders-corpus", "ROSTER.md"), "utf8"),
    );
    const refreshed: FounderReport = {
      slug: "naval",
      status: "pass",
      posts: 202,
      words: 293_000,
    };

    const merged = mergeFounderReports({
      roster: reportsFromRoster(roster),
      prior: [],
      fresh: [refreshed],
    });

    expect(merged).toHaveLength(roster.length);
    expect(merged.find((report) => report.slug === "naval")).toEqual(refreshed);
    expect(merged.some((report) => report.slug === "garry-tan")).toBe(true);
    expect(merged.some((report) => report.slug === "patrick-collison")).toBe(true);
  });
});

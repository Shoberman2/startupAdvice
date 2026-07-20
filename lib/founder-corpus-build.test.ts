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

  test("supports equals syntax, comma-separated values, trimming, and deduplication", () => {
    expect(
      collectOnlySlugs([
        "--force",
        "--only=naval, garry-tan",
        "--only",
        "naval,patrick-collison",
      ]),
    ).toEqual(["naval", "garry-tan", "patrick-collison"]);
  });

  test("returns an empty list when no founder filter is supplied", () => {
    expect(collectOnlySlugs(["--force", "--max-posts", "50"])).toEqual([]);
  });

  test.each([
    [["--only"]],
    [["--only", "--force"]],
    [["--only="]],
    [["--only", " , "]],
  ])("rejects an empty or missing --only value: %j", (args) => {
    expect(() => collectOnlySlugs(args)).toThrow(
      "--only requires one or more comma-separated founder slugs",
    );
  });

  test("uses committed index metadata when local post files are absent", () => {
    const index = readFileSync(
      join(import.meta.dirname, "..", ".claude", "founders-corpus", "garry-tan", "INDEX.md"),
      "utf8",
    );

    expect(corpusIndexStats(index)).toEqual({ posts: 223, words: 118_734 });
  });

  test.each([
    "",
    "posts and words omitted",
    "eight posts, 9,000 words.",
    "8 posts, 9000 words",
  ])("returns null for malformed corpus metadata: %j", (source) => {
    expect(corpusIndexStats(source)).toBeNull();
  });

  test("maps roster statistics into preserved founder reports", () => {
    expect(
      reportsFromRoster([
        {
          name: "Example Founder",
          company: "Example Co",
          slug: "example-founder",
          posts: 12,
          wordsK: 34,
        },
      ]),
    ).toEqual([
      {
        slug: "example-founder",
        status: "pass",
        posts: 12,
        words: 34_000,
        note: "preserved from committed roster",
      },
    ]);
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

  test("applies merge precedence in roster, prior, fresh order", () => {
    const roster: FounderReport = { slug: "naval", status: "pass", posts: 10, words: 10_000 };
    const prior: FounderReport = { slug: "naval", status: "thin", posts: 11, words: 11_000 };
    const fresh: FounderReport = { slug: "naval", status: "pass", posts: 12, words: 12_000 };

    expect(mergeFounderReports({ roster: [roster], prior: [prior], fresh: [] })).toEqual([prior]);
    expect(mergeFounderReports({ roster: [roster], prior: [prior], fresh: [fresh] })).toEqual([fresh]);
  });

  test("retains unique founders from every report source", () => {
    const roster: FounderReport = { slug: "naval", status: "pass", posts: 10, words: 10_000 };
    const prior: FounderReport = { slug: "garry-tan", status: "pass", posts: 11, words: 11_000 };
    const fresh: FounderReport = { slug: "patrick-collison", status: "pass", posts: 12, words: 12_000 };

    expect(mergeFounderReports({ roster: [roster], prior: [prior], fresh: [fresh] })).toEqual([
      roster,
      prior,
      fresh,
    ]);
  });
});

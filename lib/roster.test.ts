import { describe, expect, test } from "vitest";
import { loadRoster, parseRoster, rosterStats } from "./roster";

describe("parseRoster", () => {
  test("parses numbered roster rows", () => {
    const members = parseRoster(
      [
        "| # | Name | Company | Posts | Words | Slug |",
        "|---|---|---|---|---|---|",
        "| 1 | Paul Graham | Y Combinator | 229 | 546k | `paul-graham` |",
        "| 2 | Naval Ravikant | AngelList | 201 | 292k | `naval` |",
      ].join("\n"),
    );
    expect(members).toHaveLength(2);
    expect(members[0]).toEqual({ name: "Paul Graham", company: "Y Combinator", posts: 229, wordsK: 546, slug: "paul-graham" });
  });

  test("ignores header and separator rows", () => {
    expect(parseRoster("| # | Name | Company | Posts | Words | Slug |\n|---|---|---|---|---|---|")).toHaveLength(0);
  });
});

describe("committed roster", () => {
  test("loads with plausible totals", () => {
    const members = loadRoster();
    const stats = rosterStats(members);
    expect(stats.voices).toBeGreaterThanOrEqual(30);
    expect(stats.posts).toBeGreaterThan(1000);
    expect(Number(stats.millionWords)).toBeGreaterThan(1);
    expect(new Set(members.map((m) => m.slug)).size).toBe(members.length);
  });
});

import { describe, expect, it } from "vitest";
import { normalize, validateCitations } from "./validate-citations";

const chunk = (index: number, text: string) => ({
  index,
  text,
  url: `https://example.com/${index}`,
});

describe("normalize", () => {
  it("collapses whitespace runs", () => {
    expect(normalize("  hello   world  ")).toBe("hello world");
  });

  it("normalizes smart quotes to straight quotes", () => {
    expect(normalize("She said “hello” there")).toBe('she said "hello" there');
    expect(normalize("'apostrophes'")).toBe("'apostrophes'");
    expect(normalize("‘fancy’")).toBe("'fancy'");
  });

  it("treats em/en/hyphen dashes as word boundaries (presentational)", () => {
    // All three forms collapse to a single space so quotes match regardless
    // of source vs model dash style.
    expect(normalize("yes — really – done")).toBe("yes really done");
    expect(normalize("yes-really-done")).toBe("yes really done");
    expect(normalize("yes - really - done")).toBe("yes really done");
  });

  it("converts ellipsis character to three dots", () => {
    expect(normalize("wait…")).toBe("wait...");
  });

  it("is case-insensitive", () => {
    expect(normalize("Hello World")).toBe("hello world");
  });
});

describe("validateCitations", () => {
  it("passes with valid [cite:N] markers", () => {
    const retrieved = [chunk(0, "alpha beta gamma"), chunk(1, "delta epsilon zeta")];
    const result = validateCitations("Some claim [cite:0]. Another [cite:1].", retrieved);
    expect(result.ok).toBe(true);
    expect(result.referencedIndices.sort()).toEqual([0, 1]);
  });

  it("fails when [cite:N] references a missing chunk", () => {
    const retrieved = [chunk(0, "alpha beta gamma")];
    const result = validateCitations("Phantom claim [cite:5].", retrieved);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("[cite:5]");
  });

  it("passes when a ≥10-word quote appears verbatim in a chunk", () => {
    const retrieved = [
      chunk(
        0,
        "Startups should focus on what users actually want and ignore everything else for the first year.",
      ),
    ];
    const answer =
      'As Paul wrote, "focus on what users actually want and ignore everything else for the first year" [cite:0].';
    expect(validateCitations(answer, retrieved).ok).toBe(true);
  });

  it("passes when the quote uses smart quotes and dashes that match after normalization", () => {
    const retrieved = [
      chunk(
        0,
        "Founders should expect — without complaint — that the first year will be brutal and lonely.",
      ),
    ];
    const answer =
      'He warned that "founders should expect—without complaint—that the first year will be brutal and lonely" [cite:0].';
    expect(validateCitations(answer, retrieved).ok).toBe(true);
  });

  it("ignores quotes shorter than 10 words", () => {
    const retrieved = [chunk(0, "irrelevant chunk text")];
    const answer = 'A short "fake quote" should not trigger validation [cite:0].';
    expect(validateCitations(answer, retrieved).ok).toBe(true);
  });

  it("fails when a ≥10-word verbatim quote is fabricated", () => {
    const retrieved = [chunk(0, "the actual essay says something completely different than the claim")];
    const answer =
      'PG wrote "raise as much venture capital as you can before you have a clear plan for it" [cite:0].';
    const result = validateCitations(answer, retrieved);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Verbatim quote");
  });
});

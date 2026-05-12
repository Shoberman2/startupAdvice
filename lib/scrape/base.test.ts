import { describe, expect, it } from "vitest";
import { chunkHash, chunkParagraphs, htmlToParagraphs } from "./base";

describe("htmlToParagraphs", () => {
  it("extracts <p> text in document order", () => {
    const html = "<html><body><p>One</p><p>Two</p><p>Three</p></body></html>";
    expect(htmlToParagraphs(html)).toEqual(["One", "Two", "Three"]);
  });

  it("collapses internal whitespace", () => {
    const html = "<html><body><p>  Hello\n  world  </p></body></html>";
    expect(htmlToParagraphs(html)).toEqual(["Hello world"]);
  });

  it("drops empty paragraphs", () => {
    const html = "<html><body><p>One</p><p></p><p>   </p><p>Two</p></body></html>";
    expect(htmlToParagraphs(html)).toEqual(["One", "Two"]);
  });

  it("scopes to a content selector", () => {
    const html =
      "<html><body><nav><p>Nav text</p></nav><main><p>Body 1</p><p>Body 2</p></main></body></html>";
    expect(htmlToParagraphs(html, { withinSelector: "main" })).toEqual(["Body 1", "Body 2"]);
  });
});

describe("chunkParagraphs", () => {
  it("packs short paragraphs into one chunk", () => {
    const paragraphs = ["a", "b", "c"];
    const chunks = chunkParagraphs(paragraphs, 800, 100);
    expect(chunks.length).toBe(1);
    expect(chunks[0].paragraphIndex).toBe(0);
  });

  it("splits when target tokens are exceeded", () => {
    const long = "x".repeat(4000); // ~1000 tokens
    const paragraphs = [long, long, long, long];
    const chunks = chunkParagraphs(paragraphs, 800, 100);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("records paragraph index of the first paragraph in each chunk", () => {
    const long = "x".repeat(4000);
    const paragraphs = [long, long, long, long];
    const chunks = chunkParagraphs(paragraphs, 800, 100);
    expect(chunks[0].paragraphIndex).toBe(0);
    expect(chunks[1].paragraphIndex).toBeGreaterThan(0);
  });
});

describe("chunkHash", () => {
  it("returns a 64-char sha256 hex", () => {
    expect(chunkHash("pg", "https://x/y", 0, "text")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic", () => {
    const a = chunkHash("pg", "https://x/y", 0, "text");
    const b = chunkHash("pg", "https://x/y", 0, "text");
    expect(a).toBe(b);
  });

  it("differs when any input differs", () => {
    const base = chunkHash("pg", "https://x/y", 0, "text");
    expect(chunkHash("naval", "https://x/y", 0, "text")).not.toBe(base);
    expect(chunkHash("pg", "https://x/z", 0, "text")).not.toBe(base);
    expect(chunkHash("pg", "https://x/y", 1, "text")).not.toBe(base);
    expect(chunkHash("pg", "https://x/y", 0, "TEXT")).not.toBe(base);
  });
});

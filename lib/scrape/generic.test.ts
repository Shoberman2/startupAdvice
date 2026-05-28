import { describe, expect, it } from "vitest";
import { parseFeedPostUrls } from "./generic";

describe("parseFeedPostUrls", () => {
  it("extracts RSS item links", () => {
    const xml = `
      <rss><channel>
        <item><title>One</title><link>https://example.com/posts/one</link></item>
        <item><title>Two</title><link>https://example.com/posts/two?x=1&amp;y=2</link></item>
      </channel></rss>
    `;

    expect(parseFeedPostUrls(xml, "https://example.com")).toEqual([
      "https://example.com/posts/one",
      "https://example.com/posts/two?x=1&y=2",
    ]);
  });

  it("extracts Atom alternate links", () => {
    const xml = `
      <feed>
        <entry>
          <title>One</title>
          <link rel="alternate" href="/posts/one" />
        </entry>
      </feed>
    `;

    expect(parseFeedPostUrls(xml, "https://example.com/feed.xml")).toEqual([
      "https://example.com/posts/one",
    ]);
  });
});

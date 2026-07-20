import { describe, expect, it } from "vitest";
import { extractDate, extractPaulGrahamParagraphs } from "./paul-graham";

describe("extractPaulGrahamParagraphs", () => {
  it("keeps article text after a nested promotional font closes", () => {
    const html = `
      <html><body>
        <font size="2" face="verdana">
          <table><tr><td><font size=2>Want to start a startup? Get funded.</font></td></tr></table>
          <p>July 2013<br><br>
          First article paragraph with a source-grounded startup argument.<br><br>
          Second article paragraph that appears after the nested font closed.<br><br>
          <b>Thanks</b> to the readers.
        </font>
        <font size="2" face="verdana">Japanese Translation</font>
      </body></html>
    `;

    expect(extractPaulGrahamParagraphs(html)).toEqual([
      "First article paragraph with a source-grounded startup argument.",
      "Second article paragraph that appears after the nested font closed.",
      "Thanks to the readers.",
    ]);
  });

  it("keeps text after nested footnote fonts", () => {
    const html = `
      <font size=2 face=verdana>
        Opening paragraph.<br><br>
        A claim with <font color=#dddddd>[<a href="#f1n">1</a>]</font> a footnote.<br><br>
        Closing paragraph.
      </font>
    `;

    expect(extractPaulGrahamParagraphs(html)).toEqual([
      "Opening paragraph.",
      "A claim with [1] a footnote.",
      "Closing paragraph.",
    ]);
  });

  it("falls back to semantic paragraphs when no font wrapper exists", () => {
    expect(extractPaulGrahamParagraphs("<main><p>One</p><p>Two</p></main>")).toEqual(["One", "Two"]);
  });

  it("terminates and keeps content when a legacy font tag is unclosed", () => {
    const html = '<font size="2">Opening paragraph.<br><br>Closing paragraph.';
    expect(extractPaulGrahamParagraphs(html)).toEqual(["Opening paragraph.", "Closing paragraph."]);
  });
});

describe("extractDate", () => {
  it("finds a date inside the outer article font", () => {
    expect(extractDate('<font size="2">July 2013<br><br>Essay</font>')).toBe("2013-07-01");
  });
});

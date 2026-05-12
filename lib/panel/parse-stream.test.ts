import { describe, expect, it } from "vitest";
import { DelimitedStreamParser } from "./parse-stream";

const wellFormed =
  '[REASONING_JSON]{"retrieved":[{"index":0,"text":"essay text","url":"https://x"}],"weighing":"balancing X against Y"}[/REASONING_JSON][ANSWER]Hello world [cite:0].[/ANSWER]';

describe("DelimitedStreamParser", () => {
  it("parses a well-formed stream emitted in one chunk", () => {
    const p = new DelimitedStreamParser();
    const events = p.push(wellFormed);
    expect(events[0].type).toBe("reasoning");
    expect(events[0].reasoning?.weighing).toBe("balancing X against Y");
    expect(events.some((e) => e.type === "answer-delta" && e.delta === "Hello world [cite:0]."))
      .toBe(true);
    expect(events.at(-1)?.type).toBe("done");
    expect(p.done).toBe(true);
  });

  it("handles delimiters split across chunks", () => {
    const p = new DelimitedStreamParser();
    const chunks = [
      "[REASON",
      "ING_JSON]",
      '{"retrieved":[],"weighing":""}',
      "[/REASONING_JSON][ANSW",
      "ER]Streaming answer body[/ANSWER]",
    ];
    const events = chunks.flatMap((c) => p.push(c));
    expect(events.find((e) => e.type === "reasoning")?.reasoning?.retrieved).toEqual([]);
    expect(events.filter((e) => e.type === "answer-delta").map((e) => e.delta).join(""))
      .toBe("Streaming answer body");
    expect(p.done).toBe(true);
  });

  it("emits answer deltas without splitting the [/ANSWER] delimiter across pushes", () => {
    const p = new DelimitedStreamParser();
    const first = p.push(
      '[REASONING_JSON]{"retrieved":[],"weighing":""}[/REASONING_JSON][ANSWER]Some text',
    );
    const second = p.push("[/ANSWER]");

    // The parser MUST hold back the trailing 9 chars (length of "[/ANSWER]")
    // until the next push, in case the closing delimiter is being assembled.
    // So "Some text" arrives across both pushes.
    const allDeltas = [...first, ...second]
      .filter((e) => e.type === "answer-delta")
      .map((e) => e.delta)
      .join("");
    expect(allDeltas).toBe("Some text");
    expect(second.at(-1)?.type).toBe("done");
  });

  it("treats malformed JSON as empty reasoning rather than failing", () => {
    const p = new DelimitedStreamParser();
    p.push("[REASONING_JSON]not a valid json[/REASONING_JSON][ANSWER]ok[/ANSWER]");
    expect(p.done).toBe(true);
  });
});

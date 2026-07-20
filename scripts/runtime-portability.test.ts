import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

const scripts = [
  "build-founders-corpus.ts",
  "build-garry-corpus.ts",
  "fetch-founder-portraits.ts",
  "validate-founder-skills.ts",
];

describe("script runtime portability", () => {
  test.each(scripts)("%s uses the standard import.meta dirname", (script) => {
    const source = readFileSync(join(process.cwd(), "scripts", script), "utf8");

    expect(source).not.toMatch(/\bimport\.meta\.dir\b/);
    expect(source).toContain("import.meta.dirname");
  });
});

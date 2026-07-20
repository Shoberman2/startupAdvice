import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const scripts = {
  "build-founders-corpus.ts": 'const ROOT = join(import.meta.dirname, "..");',
  "build-garry-corpus.ts": 'const OUT_DIR = join(import.meta.dirname, "..",',
  "fetch-founder-portraits.ts": 'const ROOT = join(import.meta.dirname, "..");',
  "validate-founder-skills.ts": 'const ROOT = join(import.meta.dirname, "..");',
};

describe("script runtime portability", () => {
  test("standard import.meta dirname resolves the repository root", () => {
    const packageJson = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8"),
    ) as { name?: string };

    expect(packageJson.name).toBe("founder-panel");
  });

  test.each(Object.entries(scripts))(
    "%s derives its output root from the standard import.meta dirname",
    (script, rootExpression) => {
      const source = readFileSync(join(process.cwd(), "scripts", script), "utf8");

      expect(source).not.toMatch(/\bimport\.meta\.dir\b/);
      expect(source).toContain(rootExpression);
    },
  );
});

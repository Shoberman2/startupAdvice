import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function pngMetadata(relativePath: string) {
  const source = readFileSync(join(ROOT, relativePath));

  expect(source.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );

  return {
    width: source.readUInt32BE(16),
    height: source.readUInt32BE(20),
    bitDepth: source[24],
    colorType: source[25],
  };
}

describe("Product Hunt launch assets", () => {
  test.each([
    ["public/brand/founder-panel-logo.png", 1254],
    ["public/brand/founder-panel-product-hunt.png", 930],
    ["app/icon.png", 512],
  ])("ships a square, transparent RGBA PNG at %s", (relativePath, size) => {
    expect(pngMetadata(relativePath)).toEqual({
      width: size,
      height: size,
      bitDepth: 8,
      colorType: 6,
    });
  });

  test("renders the compact logo in both the header and footer", () => {
    const page = readFileSync(join(ROOT, "app", "page.tsx"), "utf8");
    const logoReferences = page.match(/src="\/brand\/founder-panel-product-hunt\.png"/g) ?? [];

    expect(logoReferences).toHaveLength(2);
    expect(page).toContain('aria-label="Founder Panel home"');
    expect(page).toContain('alt=""');
  });

  test("keeps launch-critical mobile overflow and credit target safeguards", () => {
    const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");

    expect(css).toContain("overflow-wrap: anywhere;");
    expect(css).toMatch(/\.image-credits a\s*{[^}]*min-height:\s*24px;/s);
    expect(css).toMatch(/\.install-copy,\s*\n\s*\.install-block-wrap\s*{[^}]*min-width:\s*0;/s);
  });
});

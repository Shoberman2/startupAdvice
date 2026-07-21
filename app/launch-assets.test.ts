import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
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
  test("keeps the Product Hunt tagline and description within listing limits", () => {
    const launchCopy = readFileSync(join(ROOT, "PRODUCT_HUNT.md"), "utf8");
    const tagline = /## Tagline\s+([^\n]+)/.exec(launchCopy)?.[1].trim();
    const description = /## Description\s+([^\n]+)/.exec(launchCopy)?.[1].trim();

    expect(tagline).toBe("Startup advice grounded in 50 founders' public writing");
    expect(tagline?.length).toBeLessThanOrEqual(60);
    expect(description?.length).toBeLessThanOrEqual(260);
    expect(description).toContain("20,347 public posts");
    expect(description).toContain("50 founders and investors");
  });

  test("ships a playable 1080p Product Hunt demo and poster", async () => {
    const videoPath = join(ROOT, "public", "launch", "founder-panel-terminal-demo.mp4");
    const video = readFileSync(videoPath);
    const poster = await sharp(join(ROOT, "public", "launch", "founder-panel-terminal-demo-poster.png"))
      .metadata();

    expect(video.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(statSync(videoPath).size).toBeGreaterThan(1_000_000);
    expect(poster.width).toBe(1920);
    expect(poster.height).toBe(1080);
  });

  test.each([
    ["public/brand/founder-panel-logo.png", 1254],
    ["public/brand/founder-panel-product-hunt.png", 930],
    ["app/icon.png", 512],
  ])("ships a square, opaque paper-background RGBA PNG at %s", async (relativePath, size) => {
    expect(pngMetadata(relativePath)).toEqual({
      width: size,
      height: size,
      bitDepth: 8,
      colorType: 6,
    });

    const { data, info } = await sharp(join(ROOT, relativePath))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixelAt = (x: number, y: number) => {
      const offset = (y * info.width + x) * info.channels;
      return [...data.subarray(offset, offset + 4)];
    };

    expect([
      pixelAt(0, 0),
      pixelAt(info.width - 1, 0),
      pixelAt(0, info.height - 1),
      pixelAt(info.width - 1, info.height - 1),
    ]).toEqual(Array.from({ length: 4 }, () => [244, 240, 231, 255]));

    let minimumAlpha = 255;
    for (let offset = 3; offset < data.length; offset += info.channels) {
      minimumAlpha = Math.min(minimumAlpha, data[offset]);
    }
    expect(minimumAlpha).toBe(255);
  });

  test("ships the Founder Panel mark as a classic browser favicon", () => {
    const favicon = readFileSync(join(ROOT, "app", "favicon.ico"));

    expect(favicon.subarray(0, 6)).toEqual(Buffer.from([0, 0, 1, 0, 1, 0]));
    expect(favicon[6]).toBe(64);
    expect(favicon[7]).toBe(64);
    expect(favicon.readUInt16LE(12)).toBe(32);
  });

  test("renders the compact logo in both the header and footer", () => {
    const page = readFileSync(join(ROOT, "app", "page.tsx"), "utf8");
    const logoReferences = page.match(/src="\/brand\/founder-panel-product-hunt\.png"/g) ?? [];

    expect(logoReferences).toHaveLength(2);
    expect(page).toContain('aria-label="Founder Panel home"');
    expect(page).toContain('alt=""');
  });

  test("embeds the terminal demo as a lightweight, accessible landing-page player", () => {
    const page = readFileSync(join(ROOT, "app", "page.tsx"), "utf8");
    const video = /<video([\s\S]*?)<\/video>/.exec(page)?.[0] ?? "";

    expect(page).toContain('href="#demo"');
    expect(page).toContain('id="demo"');
    expect(video).toContain("controls");
    expect(video).toContain("playsInline");
    expect(video).toContain('preload="metadata"');
    expect(video).toContain('poster="/launch/founder-panel-terminal-demo-poster.png"');
    expect(video).toContain('src="/launch/founder-panel-terminal-demo.mp4"');
    expect(video).not.toContain("autoPlay");
  });

  test("keeps launch-critical mobile overflow and credit target safeguards", () => {
    const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");

    expect(css).toContain("overflow-wrap: anywhere;");
    expect(css).toMatch(/\.image-credits a\s*{[^}]*min-height:\s*24px;/s);
    expect(css).toMatch(/\.install-copy,\s*\n\s*\.install-block-wrap\s*{[^}]*min-width:\s*0;/s);
  });
});

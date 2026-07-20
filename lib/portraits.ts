/**
 * Build-time reader for the licensed portrait manifest written by
 * scripts/fetch-founder-portraits.ts. Every entry is a Wikimedia Commons
 * image with a free license; the footer credits are generated from it.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Portrait {
  slug: string;
  name: string;
  file: string;
  sourceFilePage: string;
  author: string;
  license: string;
}

const MANIFEST_PATH = join(process.cwd(), "data", "founder-portraits.json");

export function loadPortraits(): Portrait[] {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Portrait[];
}

export function portraitsBySlug(): Map<string, Portrait> {
  return new Map(loadPortraits().map((portrait) => [portrait.slug, portrait]));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

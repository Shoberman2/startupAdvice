/**
 * Registry of all scrapers. The script runner walks this list to scrape the
 * full corpus. Each scraper is independently switchable so a single failing
 * module doesn't break the whole pipeline.
 */

import type { BlogScraper } from "./base";
import { paulGrahamScraper } from "./paul-graham";
import { navalScraper } from "./naval";
import { jasonFriedScraper } from "./jason-fried";
import { fredWilsonScraper } from "./fred-wilson";
import { sahilLavingiaScraper } from "./sahil-lavingia";
import { patrickCollisonScraper } from "./patrick-collison";
import { samAltmanScraper } from "./sam-altman";
import { garryTanScraper } from "./garry-tan";
import { dhhScraper } from "./david-heinemeier-hansson";
import { brianCheskyScraper } from "./brian-chesky";
import { tobiLutkeScraper } from "./tobi-lutke";
import { eugeneWeiScraper } from "./eugene-wei";
import { FOUNDER_SOURCES } from "@/data/founder-sources";
import { makeGenericScraper } from "./generic";

const BESPOKE_SCRAPERS: ReadonlyArray<BlogScraper> = [
  paulGrahamScraper,
  navalScraper,
  jasonFriedScraper,
  fredWilsonScraper,
  sahilLavingiaScraper,
  patrickCollisonScraper,
  samAltmanScraper,
  garryTanScraper,
  dhhScraper,
  brianCheskyScraper,
  tobiLutkeScraper,
  eugeneWeiScraper,
];

const BESPOKE_SLUGS = new Set(BESPOKE_SCRAPERS.map((scraper) => scraper.authorSlug));

const GENERIC_SCRAPERS: ReadonlyArray<BlogScraper> = FOUNDER_SOURCES
  .filter((source) => !BESPOKE_SLUGS.has(source.slug))
  .map(makeGenericScraper);

export const ALL_SCRAPERS: ReadonlyArray<BlogScraper> = [
  ...BESPOKE_SCRAPERS,
  ...GENERIC_SCRAPERS,
];

export function scraperFor(slug: string): BlogScraper | null {
  return ALL_SCRAPERS.find((s) => s.authorSlug === slug) ?? null;
}

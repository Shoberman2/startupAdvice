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

export const ALL_SCRAPERS: ReadonlyArray<BlogScraper> = [
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

export function scraperFor(slug: string): BlogScraper | null {
  return ALL_SCRAPERS.find((s) => s.authorSlug === slug) ?? null;
}

/**
 * Fetch properly licensed founder portraits from Wikimedia Commons.
 *
 * For each roster member: search Wikidata by name, accept an entity only when
 * its English description mentions the member's company (or the entity is
 * explicitly approved in QID_OVERRIDES after manual review), read the P18
 * portrait claim, keep it only under a free license, and download a small
 * thumbnail to public/founders/roster/<slug>.jpg.
 *
 * Writes data/founder-portraits.json with file, author, and license for the
 * footer credits. Members without a verified, freely licensed portrait are
 * simply absent from the manifest; the marquee renders an initials medallion.
 *
 * Usage: bun run scripts/fetch-founder-portraits.ts
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadRoster, type RosterMember } from "../lib/roster";

const ROOT = join(import.meta.dir, "..");
const OUT_DIR = join(ROOT, "public", "founders", "roster");
const MANIFEST = join(ROOT, "data", "founder-portraits.json");
const UA = "FounderPanel/1.0 (https://github.com/Shoberman2/startupAdvice)";
const THUMB_WIDTH = 160;

const FREE_LICENSES = /^(cc0|cc[- ]by(?:[- ]sa)?(?:[- ]\d\.\d)?|public domain|pd|attribution)/i;

/**
 * Entities approved by manual review for names whose description does not
 * mention the roster company. Never add an entry without checking the
 * description identifies the same person as the roster row.
 */
const QID_OVERRIDES: Record<string, string> = {
  // Reviewed 2026-07-20: exact name label plus a description consistent with
  // the roster member (occupation, birth year, or well-known biography).
  // Rejected after review, keep as initials: david-skok (Wikidata match is a
  // journalist), andrew-chen, jason-cohen, david-cummings, eugene-wei,
  // patrick-mckenzie, brian-balfour, nathan-barry, tomasz-tunguz, elad-gil,
  // hunter-walk (no verifiable match).
  "sam-altman": "Q7407093",
  "tobi-lutke": "Q20684647",
  "matt-mullenweg": "Q92877",
  "michael-seibel": "Q28226109",
  "caterina-fake": "Q37195",
  "steve-blank": "Q390829",
  "eric-ries": "Q1752858",
  "joel-spolsky": "Q2387083",
  "jeff-atwood": "Q4703800",
  "seth-godin": "Q439396",
  "nir-eyal": "Q7039822",
  "julie-zhuo": "Q63341423",
  "jason-fried": "Q23795888",
  "derek-sivers": "Q5262357",
  "rob-walling": "Q23761832",
  "noah-kagan": "Q7045411",
  "fred-wilson": "Q5496570",
  "brad-feld": "Q16196004",
  "chris-dixon": "Q5106403",
  "bill-gurley": "Q4909249",
  "marc-andreessen": "Q62882",
  "balaji-srinivasan": "Q87684934",
  "om-malik": "Q7089338",
  "ben-casnocha": "Q4885402",
};

/** Curated portraits that already ship with the repository. */
const SEEDED: PortraitEntry[] = [
  { slug: "paul-graham", name: "Paul Graham", file: "/founders/paul-graham.jpg", sourceFilePage: "https://commons.wikimedia.org/wiki/File:Paulgraham_240x320.jpg", author: "Sarah Harlin", license: "Public domain" },
  { slug: "naval", name: "Naval Ravikant", file: "/founders/naval-ravikant.png", sourceFilePage: "https://commons.wikimedia.org/wiki/File:Naval2019.png", author: "Edmund Hillary Fellowship", license: "CC BY 3.0" },
  { slug: "garry-tan", name: "Garry Tan", file: "/founders/garry-tan.jpg", sourceFilePage: "https://commons.wikimedia.org/wiki/File:Garry_Tan,_Web_Summit_2018,_November_6_SD5_6949_(45700698642)(portrait_4x3_crop).jpg", author: "Web Summit", license: "CC BY 2.0" },
  { slug: "patrick-collison", name: "Patrick Collison", file: "/founders/patrick-collison.jpg", sourceFilePage: "https://commons.wikimedia.org/wiki/File:Patrick_Collison.jpg", author: "JD Lasica", license: "CC BY 2.0" },
];

export interface PortraitEntry {
  slug: string;
  name: string;
  file: string;
  sourceFilePage: string;
  author: string;
  license: string;
}

async function api(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function companyTokens(company: string): string[] {
  return company
    .toLowerCase()
    .split(/[/\s]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 4);
}

function matchesCompany(description: string, member: RosterMember): boolean {
  const desc = description.toLowerCase();
  const company = member.company.toLowerCase();
  if (company.split("/").some((part) => part.trim().length >= 4 && desc.includes(part.trim()))) return true;
  return companyTokens(member.company).some((token) => desc.includes(token));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function resolveEntity(member: RosterMember): Promise<{ id: string; description: string } | { candidates: string[] }> {
  if (QID_OVERRIDES[member.slug]) return { id: QID_OVERRIDES[member.slug], description: "manual override" };
  const search = await api(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(member.name)}&language=en&type=item&format=json&limit=6`,
  );
  const candidates: string[] = [];
  for (const hit of search.search ?? []) {
    const description: string = hit.description ?? "";
    if (!description) continue;
    if (matchesCompany(description, member)) return { id: hit.id, description };
    candidates.push(`${hit.id}: ${description}`);
  }
  return { candidates };
}

async function fetchPortrait(member: RosterMember): Promise<PortraitEntry | { skipped: string }> {
  const resolved = await resolveEntity(member);
  if (!("id" in resolved)) {
    return { skipped: `no verified entity${resolved.candidates.length ? ` (candidates: ${resolved.candidates.join(" | ")})` : ""}` };
  }

  const entity = await api(
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${resolved.id}&property=P18&format=json`,
  );
  const image = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!image) return { skipped: `entity ${resolved.id} has no portrait (P18)` };

  const info = await api(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${image}`)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${THUMB_WIDTH}&format=json`,
  );
  const page = Object.values(info.query?.pages ?? {})[0] as any;
  const ii = page?.imageinfo?.[0];
  if (!ii?.thumburl) return { skipped: `no thumbnail for ${image}` };

  const licenseRaw = ii.extmetadata?.LicenseShortName?.value ?? "";
  const license = stripHtml(licenseRaw);
  if (!FREE_LICENSES.test(license)) return { skipped: `license not free: ${license || "unknown"} (${image})` };
  const author = stripHtml(ii.extmetadata?.Artist?.value ?? "Unknown");

  const res = await fetch(ii.thumburl, { headers: { "user-agent": UA } });
  if (!res.ok) return { skipped: `thumb download failed ${res.status}` };
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext = ii.thumburl.toLowerCase().includes(".png") ? "png" : "jpg";
  const fileName = `${member.slug}.${ext}`;
  await writeFile(join(OUT_DIR, fileName), bytes);

  return {
    slug: member.slug,
    name: member.name,
    file: `/founders/roster/${fileName}`,
    sourceFilePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(image.replaceAll(" ", "_"))}`,
    author: author.slice(0, 80),
    license,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const seededSlugs = new Set(SEEDED.map((entry) => entry.slug));
  const manifest: PortraitEntry[] = [...SEEDED];

  for (const member of loadRoster()) {
    if (seededSlugs.has(member.slug)) continue;
    try {
      const result = await fetchPortrait(member);
      if ("skipped" in result) {
        console.log(`skip ${member.slug}: ${result.skipped}`);
      } else {
        manifest.push(result);
        console.log(`ok   ${member.slug}: ${result.license} by ${result.author}`);
      }
    } catch (error) {
      console.log(`skip ${member.slug}: ${(error as Error).message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${manifest.length} portraits in manifest (${manifest.length - SEEDED.length} fetched). Wrote ${MANIFEST}`);
}

main();

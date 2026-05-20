import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { ALL_PROFILES, FOUNDERS_BY_SLUG } from "./profiles";
import { listFounders, listFounderSlugs } from "./index";

function personaSlugs(): string[] {
  const dir = join(process.cwd(), "personas");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

describe("founder profiles", () => {
  it("has a profile for every persona on disk", () => {
    for (const slug of personaSlugs()) {
      expect(
        FOUNDERS_BY_SLUG.has(slug),
        `personas/${slug}.md has no profile in lib/founders/profiles.ts`,
      ).toBe(true);
    }
  });

  it("has a persona file for every profile", () => {
    const personas = new Set(personaSlugs());
    for (const profile of ALL_PROFILES) {
      expect(
        personas.has(profile.slug),
        `profile '${profile.slug}' has no persona at personas/${profile.slug}.md`,
      ).toBe(true);
    }
  });

  it("every profile has non-empty required content", () => {
    for (const profile of ALL_PROFILES) {
      expect(profile.slug, "slug").toBeTruthy();
      expect(profile.company.length, `${profile.slug}: company`).toBeGreaterThan(0);
      expect(profile.bio.length, `${profile.slug}: bio`).toBeGreaterThan(40);
      expect(profile.why_listen.length, `${profile.slug}: why_listen`).toBeGreaterThan(20);
      expect(profile.signature_ideas.length, `${profile.slug}: signature_ideas`).toBeGreaterThan(0);
      expect(profile.notable_wins.length, `${profile.slug}: notable_wins`).toBeGreaterThan(0);
      expect(profile.notable_failures.length, `${profile.slug}: notable_failures`).toBeGreaterThan(0);
    }
  });

  it("no two profiles share a slug", () => {
    const seen = new Set<string>();
    for (const profile of ALL_PROFILES) {
      expect(seen.has(profile.slug), `duplicate slug: ${profile.slug}`).toBe(false);
      seen.add(profile.slug);
    }
  });

  it("listFounderSlugs returns one entry per profile in declared order", () => {
    expect(listFounderSlugs()).toEqual(ALL_PROFILES.map((p) => p.slug));
  });

  it("listFounders joins personas + profiles and preserves profile order", async () => {
    const founders = await listFounders();
    expect(founders.length).toBe(ALL_PROFILES.length);
    for (let i = 0; i < founders.length; i++) {
      expect(founders[i].slug).toBe(ALL_PROFILES[i].slug);
      expect(founders[i].name.length).toBeGreaterThan(0);
      expect(founders[i].era.length).toBeGreaterThan(0);
      expect(founders[i].blogUrl.length).toBeGreaterThan(0);
      expect(founders[i].profile.bio).toBe(ALL_PROFILES[i].bio);
    }
  });
});

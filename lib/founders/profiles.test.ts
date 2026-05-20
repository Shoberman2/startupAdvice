import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  ALL_PROFILES,
  FOUNDERS_BY_SLUG,
  isDirectoryOnly,
} from "./profiles";
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

  it("persona-backed profiles correspond to existing persona files", () => {
    const personas = new Set(personaSlugs());
    for (const profile of ALL_PROFILES) {
      if (isDirectoryOnly(profile)) continue;
      expect(
        personas.has(profile.slug),
        `chat-able profile '${profile.slug}' has no persona at personas/${profile.slug}.md`,
      ).toBe(true);
    }
  });

  it("directory-only profiles supply inline name/era/blog_url", () => {
    for (const profile of ALL_PROFILES) {
      if (!isDirectoryOnly(profile)) continue;
      expect(profile.name.length, `${profile.slug}: name`).toBeGreaterThan(0);
      expect(profile.era.length, `${profile.slug}: era`).toBeGreaterThan(0);
      expect(profile.blog_url.length, `${profile.slug}: blog_url`).toBeGreaterThan(0);
    }
  });

  it("every profile has non-empty required content", () => {
    for (const profile of ALL_PROFILES) {
      expect(profile.slug, "slug").toBeTruthy();
      expect(profile.company.length, `${profile.slug}: company`).toBeGreaterThan(0);
      expect(profile.primary_source.length, `${profile.slug}: primary_source`).toBeGreaterThan(0);
      expect(profile.bio.length, `${profile.slug}: bio`).toBeGreaterThan(80);
      expect(profile.why_listen.length, `${profile.slug}: why_listen`).toBeGreaterThan(20);
    }
  });

  it("every profile has at least 3 notable_stories with title + body", () => {
    for (const profile of ALL_PROFILES) {
      expect(
        profile.notable_stories.length,
        `${profile.slug}: notable_stories count`,
      ).toBeGreaterThanOrEqual(3);
      for (const story of profile.notable_stories) {
        expect(story.title.length, `${profile.slug}: story title`).toBeGreaterThan(0);
        expect(story.body.length, `${profile.slug}: story body too short`).toBeGreaterThan(60);
      }
    }
  });

  it("every profile has at least 5 advice items with headline + elaboration", () => {
    for (const profile of ALL_PROFILES) {
      expect(
        profile.advice.length,
        `${profile.slug}: advice count`,
      ).toBeGreaterThanOrEqual(5);
      for (const item of profile.advice) {
        expect(item.headline.length, `${profile.slug}: advice headline`).toBeGreaterThan(0);
        expect(
          item.elaboration.length,
          `${profile.slug}: advice elaboration`,
        ).toBeGreaterThan(20);
      }
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

  it("directoryOnly flag matches profile shape", async () => {
    const founders = await listFounders();
    for (const founder of founders) {
      expect(founder.directoryOnly).toBe(isDirectoryOnly(founder.profile));
    }
  });
});

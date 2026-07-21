import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { buildFounder, migrateGarry } from "./build-founders-corpus";

const CORPUS_ROOT = join(import.meta.dirname, "..", ".claude", "founders-corpus");
const MALFORMED_SLUG = "__vitest-malformed-index__";
const MALFORMED_DIR = join(CORPUS_ROOT, MALFORMED_SLUG);

afterAll(async () => {
  await rm(MALFORMED_DIR, { recursive: true, force: true });
});

describe("founder corpus builder integration", () => {
  test("uses Garry Tan's committed index when local post files are absent", async () => {
    await expect(migrateGarry()).resolves.toEqual({
      slug: "garry-tan",
      status: "pass",
      posts: 223,
      words: 118_734,
    });
  });

  test("returns parsed statistics when an existing founder index is skipped", async () => {
    await expect(buildFounder("naval", 100, false)).resolves.toMatchObject({
      slug: "naval",
      status: "skipped_existing",
      posts: 201,
      words: 292_088,
    });
  });

  test("safely returns zero statistics for an existing malformed index", async () => {
    await mkdir(MALFORMED_DIR, { recursive: true });
    await writeFile(join(MALFORMED_DIR, "INDEX.md"), "# Malformed test index\n");

    await expect(buildFounder(MALFORMED_SLUG, 100, false)).resolves.toEqual({
      slug: MALFORMED_SLUG,
      status: "skipped_existing",
      posts: 0,
      words: 0,
    });
  });
});

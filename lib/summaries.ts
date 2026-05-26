/**
 * Read-side helpers for the `summaries` table. Used by the /think library
 * pages and (eventually) by the chat + debate features as cross-links.
 *
 * Reads always return the most recent prompt_version per (founder, topic).
 */

import { queryWithTimeout } from "@/lib/db/client";

export interface SummaryCitation {
  index: number;
  post_url: string;
  post_title: string;
  paragraph_idx: number;
}

export interface Summary {
  founderSlug: string;
  topicSlug: string;
  topicLabel: string;
  content: string;
  citations: SummaryCitation[];
  promptVersion: string;
  generatedAt: string;
}

interface Row {
  founder_slug: string;
  topic_slug: string;
  topic_label: string;
  content: string;
  citations: SummaryCitation[];
  prompt_version: string;
  generated_at: Date;
}

const SUMMARY_READ_TIMEOUT_MS = 2_000;

async function readSummaryData<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch {
    return null;
  }
}

function rowToSummary(r: Row): Summary {
  return {
    founderSlug: r.founder_slug,
    topicSlug: r.topic_slug,
    topicLabel: r.topic_label,
    content: r.content,
    citations: r.citations ?? [],
    promptVersion: r.prompt_version,
    generatedAt: r.generated_at.toISOString(),
  };
}

/** Fetch one summary, or null if none has been generated yet. */
export async function getSummary(
  founderSlug: string,
  topicSlug: string,
): Promise<Summary | null> {
  return readSummaryData(
    async () => {
      const rows = await queryWithTimeout<Row>(
        `SELECT founder_slug, topic_slug, topic_label, content, citations, prompt_version, generated_at
         FROM summaries
         WHERE founder_slug = $1 AND topic_slug = $2
         ORDER BY generated_at DESC
         LIMIT 1`,
        [founderSlug, topicSlug],
        SUMMARY_READ_TIMEOUT_MS,
      );
      const row = rows[0];
      return row ? rowToSummary(row) : null;
    },
  );
}

/** All summaries for one founder, newest version per topic. */
export async function listSummariesByFounder(founderSlug: string): Promise<Summary[]> {
  return (await readSummaryData(
    async () => {
      const rows = await queryWithTimeout<Row>(
        `SELECT DISTINCT ON (topic_slug)
           founder_slug, topic_slug, topic_label, content, citations, prompt_version, generated_at
         FROM summaries
         WHERE founder_slug = $1
         ORDER BY topic_slug, generated_at DESC`,
        [founderSlug],
        SUMMARY_READ_TIMEOUT_MS,
      );
      return rows.map(rowToSummary);
    },
  )) ?? [];
}

/** All summaries for one topic across founders, newest version per founder. */
export async function listSummariesByTopic(topicSlug: string): Promise<Summary[]> {
  return (await readSummaryData(
    async () => {
      const rows = await queryWithTimeout<Row>(
        `SELECT DISTINCT ON (founder_slug)
           founder_slug, topic_slug, topic_label, content, citations, prompt_version, generated_at
         FROM summaries
         WHERE topic_slug = $1
         ORDER BY founder_slug, generated_at DESC`,
        [topicSlug],
        SUMMARY_READ_TIMEOUT_MS,
      );
      return rows.map(rowToSummary);
    },
  )) ?? [];
}

/** Summary stub (founder, topic, exists/not) for grid views. */
export interface SummaryStub {
  founderSlug: string;
  topicSlug: string;
}

/** A grid of which (founder, topic) cells have summaries — used by /think index. */
export async function listAllSummaryStubs(): Promise<SummaryStub[]> {
  return (await readSummaryData(
    async () => {
      const rows = await queryWithTimeout<{ founder_slug: string; topic_slug: string }>(
        `SELECT DISTINCT founder_slug, topic_slug FROM summaries`,
        [],
        SUMMARY_READ_TIMEOUT_MS,
      );
      return rows.map((r) => ({
        founderSlug: r.founder_slug,
        topicSlug: r.topic_slug,
      }));
    },
  )) ?? [];
}

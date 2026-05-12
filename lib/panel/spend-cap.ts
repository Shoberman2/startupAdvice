/**
 * Daily LLM spend cap with auto-degradation.
 *
 * The cap is read from DAILY_LLM_SPEND_CAP_USD (default $200). Each LLM call
 * inserts a row into spend_tracker recording cost. Before answering a new
 * panel question, the select endpoint calls isOverCap() — if true, the request
 * is rejected with code SPEND_CAP_HIT and the UI shows "We've hit today's
 * spend limit." Effectively auto-flips PANEL_LIVE_MODE=cache_only for 24h.
 */

import { db } from "@/lib/db/client";

const DEFAULT_CAP_USD = 200;

/**
 * Sonnet 4.6 pricing (USD per million tokens, retail public list as of writing).
 * Adjust if AI Gateway pricing differs.
 */
export const SONNET_PRICING = {
  inputPerM: 3.0,
  outputPerM: 15.0,
} as const;

/** OpenAI text-embedding-3-small public list price. */
export const EMBED_PRICING = {
  perM: 0.02,
} as const;

export function dollarsForSonnetCall(tokensIn: number, tokensOut: number): number {
  return (tokensIn * SONNET_PRICING.inputPerM + tokensOut * SONNET_PRICING.outputPerM) / 1_000_000;
}

export function dollarsForEmbedCall(tokens: number): number {
  return (tokens * EMBED_PRICING.perM) / 1_000_000;
}

export interface SpendRow {
  request_id: string;
  panelist_slug: string | null;
  cost_usd: number;
  tokens_in: number;
  tokens_out: number;
}

export async function recordSpend(row: SpendRow): Promise<void> {
  await db.query(
    `INSERT INTO spend_tracker (request_id, panelist_slug, cost_usd, tokens_in, tokens_out)
     VALUES ($1, $2, $3, $4, $5)`,
    [row.request_id, row.panelist_slug, row.cost_usd, row.tokens_in, row.tokens_out],
  );
}

interface SumRow {
  total: string | null;
}

export async function getDailySpendUsd(): Promise<number> {
  const result = await db.query<SumRow>(
    `SELECT COALESCE(SUM(cost_usd), 0)::text AS total
     FROM spend_tracker
     WHERE created_at > NOW() - INTERVAL '24 hours'`,
  );
  return parseFloat(result.rows[0]?.total ?? "0");
}

export function getCapUsd(): number {
  const raw = process.env.DAILY_LLM_SPEND_CAP_USD;
  if (!raw) return DEFAULT_CAP_USD;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CAP_USD;
}

export async function isOverCap(): Promise<{ over: boolean; spent: number; cap: number }> {
  const [spent, cap] = [await getDailySpendUsd(), getCapUsd()];
  return { over: spent >= cap, spent, cap };
}

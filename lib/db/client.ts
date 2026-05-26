import { Pool, type QueryResultRow } from "pg";
import type { QueryConfig } from "pg";
import { registerType } from "pgvector/pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const CONNECTION_TIMEOUT_MS = 5_000;
const QUERY_TIMEOUT_MS = 30_000;

function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({
    connectionString: url,
    max: 10,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    query_timeout: QUERY_TIMEOUT_MS,
    statement_timeout: QUERY_TIMEOUT_MS,
  });
  pool.on("connect", async (client) => {
    await registerType(client);
  });
  globalThis.__pgPool = pool;
  return pool;
}

// Fluid Compute reuses instances across requests, so we cache the pool on
// globalThis to avoid burning Postgres connections on every request. The proxy
// keeps DATABASE_URL validation lazy, so pages that can degrade without DB do
// not fail during module import.
export const db: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const pool = getPool();
    const value = Reflect.get(pool, prop, pool);
    return typeof value === "function" ? value.bind(pool) : value;
  },
  set(_target, prop, value) {
    return Reflect.set(getPool(), prop, value);
  },
});

export async function query<T extends QueryResultRow>(
  sql: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params as unknown[]);
  return result.rows;
}

export async function queryWithTimeout<T extends QueryResultRow>(
  sql: string,
  params: ReadonlyArray<unknown> = [],
  timeoutMs: number,
): Promise<T[]> {
  const config = {
    text: sql,
    values: params as unknown[],
    query_timeout: timeoutMs,
  } as QueryConfig & { query_timeout: number };
  const result = await getPool().query<T>(config);
  return result.rows;
}

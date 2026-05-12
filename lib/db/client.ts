import { Pool, type QueryResultRow } from "pg";
import { registerType } from "pgvector/pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function makePool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString: url, max: 10 });
  pool.on("connect", async (client) => {
    await registerType(client);
  });
  return pool;
}

// Fluid Compute reuses instances across requests, so we cache the pool on
// globalThis to avoid burning Postgres connections on every request.
export const db: Pool = globalThis.__pgPool ?? (globalThis.__pgPool = makePool());

export async function query<T extends QueryResultRow>(
  sql: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const result = await db.query<T>(sql, params as unknown[]);
  return result.rows;
}

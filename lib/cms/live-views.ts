import { pool } from "../db/db";

const LIVE_PAGE_ID = "live-page";

// Schema (table + seed row) is managed by scripts/schema.sql. No runtime DDL.

export async function getLivePageViewCount(): Promise<number> {
  const { rows } = await pool.query(
    "SELECT view_count FROM global_view_counters WHERE id = $1",
    [LIVE_PAGE_ID]
  );
  return rows[0]?.view_count ?? 0;
}

export async function incrementLivePageViews(): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO global_view_counters (id, view_count) VALUES ($1, 1)
     ON CONFLICT (id) DO UPDATE SET view_count = global_view_counters.view_count + 1
     RETURNING view_count`,
    [LIVE_PAGE_ID]
  );
  return rows[0]?.view_count ?? 1;
}

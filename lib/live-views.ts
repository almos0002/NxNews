import { pool } from "./db";

const LIVE_PAGE_ID = "live-page";

async function ensureCountersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS global_view_counters (
      id         TEXT PRIMARY KEY,
      view_count INT  NOT NULL DEFAULT 0
    );
    INSERT INTO global_view_counters (id, view_count)
    VALUES ('${LIVE_PAGE_ID}', 0)
    ON CONFLICT (id) DO NOTHING;
  `);
}

export async function getLivePageViewCount(): Promise<number> {
  await ensureCountersTable();
  const { rows } = await pool.query(
    "SELECT view_count FROM global_view_counters WHERE id = $1",
    [LIVE_PAGE_ID]
  );
  return rows[0]?.view_count ?? 0;
}

export async function incrementLivePageViews(): Promise<number> {
  await ensureCountersTable();
  const { rows } = await pool.query(
    `INSERT INTO global_view_counters (id, view_count) VALUES ($1, 1)
     ON CONFLICT (id) DO UPDATE SET view_count = global_view_counters.view_count + 1
     RETURNING view_count`,
    [LIVE_PAGE_ID]
  );
  return rows[0]?.view_count ?? 1;
}

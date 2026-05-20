import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { rows: queries } = await pool.query(`
      SELECT
        LEFT(query, 500)              AS query,
        calls,
        ROUND(total_exec_time::numeric, 2)  AS total_ms,
        ROUND(mean_exec_time::numeric,  2)  AS mean_ms,
        ROUND(max_exec_time::numeric,   2)  AS max_ms,
        rows,
        shared_blks_hit,
        shared_blks_read
      FROM pg_stat_statements
      WHERE query NOT ILIKE '%pg_stat_statements%'
        AND query NOT ILIKE '%pg_catalog%'
        AND query NOT ILIKE 'SET %'
        AND query NOT ILIKE 'SHOW %'
      ORDER BY mean_exec_time DESC
      LIMIT 30
    `);

    const { rows: cacheRows } = await pool.query(`
      SELECT
        SUM(shared_blks_hit)                                        AS total_hit,
        SUM(shared_blks_read)                                       AS total_read,
        SUM(calls)                                                  AS total_calls,
        ROUND(SUM(total_exec_time)::numeric / 1000, 2)              AS total_exec_sec,
        COUNT(*)                                                    AS tracked_queries
      FROM pg_stat_statements
      WHERE query NOT ILIKE '%pg_stat_statements%'
        AND query NOT ILIKE '%pg_catalog%'
    `);

    const hit   = Number(cacheRows[0]?.total_hit  ?? 0);
    const read  = Number(cacheRows[0]?.total_read ?? 0);
    const total = hit + read;
    const cacheHitPct = total > 0 ? Math.round((hit / total) * 100) : null;

    return NextResponse.json({
      queries,
      summary: {
        trackedQueries: Number(cacheRows[0]?.tracked_queries ?? 0),
        totalCalls:     Number(cacheRows[0]?.total_calls ?? 0),
        totalExecSec:   Number(cacheRows[0]?.total_exec_sec ?? 0),
        cacheHitPct,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      return NextResponse.json({ error: "pg_stat_statements extension is not enabled on this database." }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await pool.query("SELECT pg_stat_statements_reset()");
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

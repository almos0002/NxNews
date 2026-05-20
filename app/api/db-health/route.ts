import { NextRequest, NextResponse } from "next/server";
import { pool, readPool } from "@/lib/db/db";
import { auth } from "@/lib/auth/auth";

interface PoolProbeResult {
  status: "ok" | "error";
  latencyMs: number | null;
  serverVersion: string | null;
  error: string | null;
  pool: {
    total: number;
    idle: number;
    waiting: number;
  };
}

async function probePool(p: typeof pool, label: string): Promise<PoolProbeResult> {
  const start = Date.now();
  try {
    const { rows } = await p.query<{ version: string }>(
      "SELECT current_setting('server_version') AS version"
    );
    return {
      status: "ok",
      latencyMs: Date.now() - start,
      serverVersion: rows[0]?.version ?? null,
      error: null,
      pool: {
        total: p.totalCount,
        idle: p.idleCount,
        waiting: p.waitingCount,
      },
    };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      serverVersion: null,
      error: err instanceof Error ? err.message : String(err),
      pool: {
        total: p.totalCount,
        idle: p.idleCount,
        waiting: p.waitingCount,
      },
    };
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hasReplica = !!process.env.NEON_READ_REPLICA_URL;
  const isSamePool = !hasReplica;

  const [primary, replica] = await Promise.all([
    probePool(pool, "primary"),
    isSamePool ? Promise.resolve(null) : probePool(readPool, "replica"),
  ]);

  const allOk = primary.status === "ok" && (!replica || replica.status === "ok");

  return NextResponse.json(
    {
      healthy: allOk,
      checkedAt: new Date().toISOString(),
      replicaConfigured: hasReplica,
      primary,
      replica: isSamePool
        ? { note: "No NEON_READ_REPLICA_URL set — readPool is aliased to primary" }
        : replica,
    },
    { status: allOk ? 200 : 503 }
  );
}

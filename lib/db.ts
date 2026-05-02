import pg from "pg";

const { Pool } = pg;

const isNeonDatabase = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("neon.tech");
  } catch {
    return false;
  }
};

const isNeonPooler = (url: string): boolean => {
  try {
    return new URL(url).hostname.includes("-pooler.");
  } catch {
    return false;
  }
};

const rawUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
const useSSL = isNeonDatabase(rawUrl);
const usePooler = isNeonPooler(rawUrl);

function buildConnectionUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("ssl");
    parsed.searchParams.delete("sslmode");
    if (useSSL) {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const cleanUrl = buildConnectionUrl(rawUrl);

// Pool tuning — optimized for Neon scale-to-zero & egress cost
// ------------------------------------------------------------
// 1. When pointed at the Neon "-pooler" endpoint (PgBouncer transaction-mode),
//    server-side pooling already multiplexes thousands of clients onto a few
//    Postgres backends. The CLIENT-side pool should therefore stay TINY
//    (max 3) — a larger pool just hoards idle connections that keep the
//    Neon compute "active" and prevent auto-suspend (= more billable hours).
// 2. idleTimeoutMillis is short (10s) so connections are released quickly,
//    letting the Neon compute scale to zero as soon as traffic dies.
// 3. allowExitOnIdle lets the Node process exit cleanly when idle.
export const pool = new Pool({
  connectionString: cleanUrl,
  ...(useSSL ? { ssl: { rejectUnauthorized: true } } : { ssl: false }),
  max: usePooler ? 3 : 10,
  idleTimeoutMillis: usePooler ? 10_000 : 30_000,
  // 15s gives Neon enough time to wake from scale-to-zero (cold start
  // is normally <2s but can be up to 5–10s on a busy free-tier project).
  connectionTimeoutMillis: 15_000,
  allowExitOnIdle: true,
  keepAlive: true,
});

pool.on("error", (err) => {
  console.error("[DB Pool Error]", err.message);
});

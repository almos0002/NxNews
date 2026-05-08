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
const useNeon = useSSL;
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

// Pool tuning
// -----------
// Neon pooler endpoint (PgBouncer transaction-mode):
//   max 3 — server-side pooling already multiplexes. A larger client pool
//   just hoards idle connections that keep Neon compute active and prevent
//   auto-suspend (= more billable compute hours).
//
// Neon direct endpoint (no pooler):
//   max 5 — with the in-memory cache in front, DB is rarely hit. Keeping
//   this small lets the compute scale to zero between request bursts.
//
// Replit Postgres (non-Neon):
//   max 10 — local connection limit is generous, keepAlive helps here.
//
// keepAlive is disabled for Neon because TCP keepalives keep the compute
// alive and block scale-to-zero, costing extra compute hours.
//
// statement_timeout kills runaway queries after 10 s so they don't hold
// connections hostage during traffic spikes.
export const pool = new Pool({
  connectionString: cleanUrl,
  ...(useSSL ? { ssl: { rejectUnauthorized: true } } : { ssl: false }),
  max: usePooler ? 3 : useNeon ? 5 : 10,
  idleTimeoutMillis: usePooler ? 10_000 : 30_000,
  connectionTimeoutMillis: 15_000,
  allowExitOnIdle: true,
  keepAlive: !useNeon,
  ...(!usePooler && useNeon
    ? {
        options: `-c statement_timeout=10000`,
      }
    : {}),
});

pool.on("error", (err) => {
  console.error("[DB Pool Error]", err.message);
});

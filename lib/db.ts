import pg from "pg";

const { Pool } = pg;

function buildConnectionUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export const pool = new Pool({
  connectionString: buildConnectionUrl(process.env.NEON_DATABASE_URL ?? ""),
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

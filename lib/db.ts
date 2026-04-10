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

const rawUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
const useSSL = isNeonDatabase(rawUrl);

function buildConnectionUrl(url: string): string {
  if (!url || !useSSL) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("sslmode", "verify-full");
    return parsed.toString();
  } catch {
    return url;
  }
}

export const pool = new Pool({
  connectionString: buildConnectionUrl(rawUrl),
  ...(useSSL ? { ssl: { rejectUnauthorized: true } } : {}),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

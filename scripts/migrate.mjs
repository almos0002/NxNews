import pg from "pg";
const { Pool } = pg;
function buildUrl(raw) {
  try { const u = new URL(raw); u.searchParams.set("sslmode","verify-full"); return u.toString(); } catch { return raw; }
}
const pool = new Pool({ connectionString: buildUrl(process.env.NEON_DATABASE_URL ?? ""), ssl: { rejectUnauthorized: true } });
await pool.query(`
  CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL, title_ne TEXT NOT NULL DEFAULT '',
    slug TEXT UNIQUE NOT NULL,
    content_en TEXT NOT NULL DEFAULT '', content_ne TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft', author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL, name_ne TEXT NOT NULL DEFAULT '',
    slug TEXT UNIQUE NOT NULL, color TEXT NOT NULL DEFAULT '#e63946',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL, name_ne TEXT NOT NULL DEFAULT '',
    slug TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL, title_ne TEXT NOT NULL DEFAULT '',
    youtube_url TEXT NOT NULL,
    description_en TEXT NOT NULL DEFAULT '', description_ne TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'published',
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);
console.log("OK");
await pool.end();

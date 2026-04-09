import { pool } from "./db";

export interface SiteSettings {
  site_title_en: string;
  site_title_ne: string;
  site_description_en: string;
  site_description_ne: string;
  contact_email: string;
  copyright_text: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  breaking_news_enabled: string;
  logo_url: string;
  favicon_url: string;
  [key: string]: string;
}

export async function getAllSettings(): Promise<SiteSettings> {
  const { rows } = await pool.query("SELECT key, value FROM settings");
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map as SiteSettings;
}

export async function getSetting(key: string): Promise<string> {
  const { rows } = await pool.query("SELECT value FROM settings WHERE key=$1", [key]);
  return rows[0]?.value ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  );
}

export async function setSettings(entries: Record<string, string>): Promise<void> {
  if (!Object.keys(entries).length) return;
  const values = Object.entries(entries)
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}, NOW())`)
    .join(", ");
  const params = Object.entries(entries).flatMap(([k, v]) => [k, v]);
  await pool.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ${values}
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    params
  );
}

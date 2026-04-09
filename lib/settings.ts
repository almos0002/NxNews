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
  seo_meta_title_template: string;
  seo_default_description_en: string;
  seo_default_description_ne: string;
  seo_og_image_url: string;
  seo_canonical_base_url: string;
  seo_ga4_id: string;
  seo_gsc_verification: string;
  seo_robots_noindex: string;
  seo_structured_data_enabled: string;
  seo_twitter_card: string;
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

export interface LocalizedSiteSettings {
  siteTitle: string;
  siteDescription: string;
  copyrightText: string;
  logoUrl: string;
  faviconUrl: string;
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

export async function getSiteSettingsForLocale(locale: string): Promise<LocalizedSiteSettings> {
  const s = await getAllSettings();
  const isNe = locale === "ne";
  return {
    siteTitle:       isNe ? (s.site_title_ne       || s.site_title_en       || "KumariHub")   : (s.site_title_en       || "KumariHub"),
    siteDescription: isNe ? (s.site_description_ne || s.site_description_en || "")            : (s.site_description_en || ""),
    copyrightText:   s.copyright_text || `© ${new Date().getFullYear()} KumariHub. All rights reserved.`,
    logoUrl:         s.logo_url       || "/logo.png",
    faviconUrl:      s.favicon_url    || "/favicon.ico",
    social: {
      twitter:   s.social_twitter   || "",
      facebook:  s.social_facebook  || "",
      instagram: s.social_instagram || "",
      youtube:   s.social_youtube   || "",
    },
  };
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

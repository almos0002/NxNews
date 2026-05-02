import { unstable_cache, revalidateTag } from "next/cache";
import { pool } from "../db/db";

const SETTINGS_CACHE_TAG = "settings";

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
  seo_bing_verification: string;
  seo_yandex_verification: string;
  seo_baidu_verification: string;
  seo_pinterest_verification: string;
  seo_robots_noindex: string;
  seo_structured_data_enabled: string;
  seo_twitter_card: string;
  [key: string]: string;
}

// Cached for 5 minutes — settings are read on every page render and almost
// never change. revalidateTag('settings') is called on every write below
// so updates appear instantly.
export const getAllSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { rows } = await pool.query("SELECT key, value_en, value_ne FROM settings");
    const map: Record<string, string> = {};
    for (const r of rows) {
      // Schema stores per-locale columns. Flatten into the historical
      // `${key}_en` / `${key}_ne` flat-key shape used everywhere in the app.
      map[`${r.key}_en`] = r.value_en ?? "";
      map[`${r.key}_ne`] = r.value_ne ?? "";
      // Also expose the raw key (uses _en as the canonical "value")
      map[r.key] = r.value_en ?? "";
    }
    return map as SiteSettings;
  },
  ["settings:all"],
  { tags: [SETTINGS_CACHE_TAG], revalidate: 300 },
);

export async function getSetting(key: string): Promise<string> {
  const all = await getAllSettings();
  return all[key] ?? "";
}

// Keys may be suffixed with _en / _ne to target a single locale column,
// or be plain (e.g. "logo_url") in which case we update both columns.
function splitLocaleKey(key: string): { baseKey: string; locale: "en" | "ne" | "both" } {
  if (key.endsWith("_en")) return { baseKey: key.slice(0, -3), locale: "en" };
  if (key.endsWith("_ne")) return { baseKey: key.slice(0, -3), locale: "ne" };
  return { baseKey: key, locale: "both" };
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { baseKey, locale } = splitLocaleKey(key);
  if (locale === "en") {
    await pool.query(
      `INSERT INTO settings (key, value_en, value_ne) VALUES ($1, $2, '')
       ON CONFLICT (key) DO UPDATE SET value_en = EXCLUDED.value_en`,
      [baseKey, value]
    );
  } else if (locale === "ne") {
    await pool.query(
      `INSERT INTO settings (key, value_en, value_ne) VALUES ($1, '', $2)
       ON CONFLICT (key) DO UPDATE SET value_ne = EXCLUDED.value_ne`,
      [baseKey, value]
    );
  } else {
    await pool.query(
      `INSERT INTO settings (key, value_en, value_ne) VALUES ($1, $2, $2)
       ON CONFLICT (key) DO UPDATE SET value_en = EXCLUDED.value_en, value_ne = EXCLUDED.value_ne`,
      [baseKey, value]
    );
  }
  revalidateTag(SETTINGS_CACHE_TAG, "default");
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

// Bulk update — collapses incoming keys (which may be suffixed _en/_ne or plain)
// into one row per baseKey with the correct value_en + value_ne. This avoids
// N round-trips and makes the bilingual settings API correct.
export async function setSettings(entries: Record<string, string>): Promise<void> {
  if (!Object.keys(entries).length) return;

  type Row = { key: string; value_en: string | null; value_ne: string | null };
  const rows = new Map<string, Row>();
  for (const [k, v] of Object.entries(entries)) {
    const { baseKey, locale } = splitLocaleKey(k);
    const existing = rows.get(baseKey) ?? { key: baseKey, value_en: null, value_ne: null };
    if (locale === "en") existing.value_en = v;
    else if (locale === "ne") existing.value_ne = v;
    else { existing.value_en = v; existing.value_ne = v; }
    rows.set(baseKey, existing);
  }

  const list = Array.from(rows.values());
  const values = list
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const params = list.flatMap((r) => [r.key, r.value_en ?? "", r.value_ne ?? ""]);
  await pool.query(
    `INSERT INTO settings (key, value_en, value_ne) VALUES ${values}
     ON CONFLICT (key) DO UPDATE SET
       value_en = COALESCE(NULLIF(EXCLUDED.value_en, ''), settings.value_en),
       value_ne = COALESCE(NULLIF(EXCLUDED.value_ne, ''), settings.value_ne)`,
    params
  );
  revalidateTag(SETTINGS_CACHE_TAG, "default");
}

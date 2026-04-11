import type { MetadataRoute } from "next";
import { pool } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";

const LOCALES = ["en", "ne"] as const;
const STATIC_PAGES = ["videos", "calendar", "live", "search"];
const CATEGORIES = [
  "world", "politics", "business", "technology",
  "science", "culture", "opinion", "sports", "entertainment",
];

async function getPublishedArticleSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const { rows } = await pool.query(
      `SELECT slug, COALESCE(updated_at, created_at) AS updated_at
       FROM article WHERE status = 'published' ORDER BY published_at DESC LIMIT 2000`
    );
    return rows.map((r) => ({
      slug: String(r.slug),
      updatedAt: r.updated_at ? new Date(r.updated_at as string).toISOString() : new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = "https://kumarihub.com";
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) {
      baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
    }
  } catch { /* use default */ }

  const now = new Date().toISOString();
  const articles = await getPublishedArticleSlugs();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({ url: `${baseUrl}/${locale}`, lastModified: now, changeFrequency: "hourly", priority: 1.0 });
    for (const cat of CATEGORIES) {
      entries.push({ url: `${baseUrl}/${locale}/${cat}`, lastModified: now, changeFrequency: "hourly", priority: 0.8 });
    }
    for (const page of STATIC_PAGES) {
      entries.push({ url: `${baseUrl}/${locale}/${page}`, lastModified: now, changeFrequency: "daily", priority: 0.6 });
    }
  }

  for (const article of articles) {
    entries.push({
      url: `${baseUrl}/en/article/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}

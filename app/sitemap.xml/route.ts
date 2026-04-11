import { pool } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const LOCALES = ["en", "ne"] as const;
const STATIC_PAGES = ["videos", "calendar", "live", "search"];
const CATEGORIES = [
  "world", "politics", "business", "technology",
  "science", "culture", "opinion", "sports", "entertainment",
];

export async function GET() {
  let baseUrl = "https://kumarihub.com";
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
  } catch { /* use default */ }

  let articleRows: Array<{ slug: string; updated_at: string }> = [];
  try {
    const result = await pool.query(
      `SELECT slug, COALESCE(updated_at, created_at) AS updated_at
       FROM article WHERE status = 'published' ORDER BY published_at DESC LIMIT 2000`
    );
    articleRows = result.rows;
  } catch { /* empty on error */ }

  const now = new Date().toISOString();

  const staticUrls: string[] = [];
  for (const locale of LOCALES) {
    staticUrls.push(`  <url>
    <loc>${baseUrl}/${locale}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`);
    for (const cat of CATEGORIES) {
      staticUrls.push(`  <url>
    <loc>${baseUrl}/${locale}/${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
    for (const page of STATIC_PAGES) {
      staticUrls.push(`  <url>
    <loc>${baseUrl}/${locale}/${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  const articleUrls = articleRows.map((r) => {
    const lastmod = r.updated_at
      ? new Date(r.updated_at).toISOString()
      : now;
    return `  <url>
    <loc>${baseUrl}/en/article/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...articleUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

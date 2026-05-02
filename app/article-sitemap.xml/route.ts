import { pool } from "@/lib/db/db";
import { getAllSettings } from "@/lib/cms/settings";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const LOCALES = ["en", "ne"] as const;

export async function GET() {
  let baseUrl = "https://kumarihub.com";
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
  } catch { /* use default */ }

  let rows: Array<{ slug: string; updated_at: string }> = [];
  try {
    const result = await pool.query(
      `SELECT slug, COALESCE(updated_at, created_at) AS updated_at
       FROM article WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 5000`
    );
    rows = result.rows;
  } catch { /* empty sitemap on error */ }

  const blocks: string[] = [];
  for (const r of rows) {
    const lastmod = r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString();
    for (const locale of LOCALES) {
      blocks.push(`  <url>
    <loc>${baseUrl}/${locale}/article/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/article/${r.slug}"/>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocks.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

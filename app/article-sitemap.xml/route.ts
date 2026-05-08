import { pool } from "@/lib/db/db";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync } from "@/lib/seo/site-url";

export const revalidate = 3600;

export async function GET() {
  let canonical: string | undefined;
  try {
    const s = await getAllSettings() as Record<string, string>;
    canonical = s.seo_canonical_base_url;
  } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(canonical);

  let rows: Array<{ slug: string; updated_at: string }> = [];
  try {
    const result = await pool.query<{ slug: string; updated_at: string }>(
      `SELECT slug, COALESCE(updated_at, created_at) AS updated_at
       FROM article
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT 5000`
    );
    rows = result.rows;
  } catch { /* empty on error */ }

  const now = new Date().toISOString();
  const blocks: string[] = [];

  for (const r of rows) {
    const lastmod = r.updated_at ? new Date(r.updated_at).toISOString() : now;
    blocks.push(`  <url>
    <loc>${baseUrl}/en/article/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/article/${r.slug}"/>
  </url>
  <url>
    <loc>${baseUrl}/ne/article/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/article/${r.slug}"/>
  </url>`);
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

import { pool } from "@/lib/db/db";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync } from "@/lib/seo/site-url";

export const revalidate = 3600;

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function GET() {
  let canonical: string | undefined;
  try {
    const s = await getAllSettings() as Record<string, string>;
    canonical = s.seo_canonical_base_url;
  } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(canonical);

  let authors: { name: string }[] = [];
  try {
    const result = await pool.query<{ name: string }>(
      `SELECT DISTINCT u.name
       FROM "user" u
       INNER JOIN article a ON a.author_id = u.id
       WHERE a.status = 'published'
         AND u.name IS NOT NULL AND u.name != ''
       ORDER BY u.name`
    );
    authors = result.rows;
  } catch { /* empty on error */ }

  const now = new Date().toISOString();
  const blocks: string[] = [];

  for (const author of authors) {
    const slug = nameToSlug(author.name);
    blocks.push(`  <url>
    <loc>${baseUrl}/en/author/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/author/${slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/author/${slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/author/${slug}"/>
  </url>`);
    blocks.push(`  <url>
    <loc>${baseUrl}/ne/author/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/author/${slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/author/${slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/author/${slug}"/>
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

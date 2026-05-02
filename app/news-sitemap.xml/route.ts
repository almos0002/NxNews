import { pool } from "@/lib/db/db";
import { getAllSettings } from "@/lib/cms/settings";

export const dynamic = "force-dynamic";
export const revalidate = 900;

interface ArticleRow {
  slug: string;
  title_en: string;
  title_ne: string | null;
  published_at: string;
  category: string;
}

export async function GET() {
  let baseUrl = "https://kumarihub.com";
  let siteName = "KumariHub";
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
    if (s.site_title_en) siteName = s.site_title_en;
  } catch { /* use defaults */ }

  let rows: ArticleRow[] = [];
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = await pool.query<ArticleRow>(
      `SELECT slug, title_en, title_ne, COALESCE(published_at, created_at) AS published_at, category
       FROM article
       WHERE status = 'published'
         AND COALESCE(published_at, created_at) >= $1
       ORDER BY published_at DESC
       LIMIT 1000`,
      [twoDaysAgo]
    );
    rows = result.rows;
  } catch { /* empty on error */ }

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const blocks: string[] = [];
  for (const r of rows) {
    const pubDate = r.published_at ? new Date(r.published_at).toISOString() : new Date().toISOString();

    // English entry
    blocks.push(`  <url>
    <loc>${baseUrl}/en/article/${r.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escape(siteName)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escape(r.title_en || r.slug)}</news:title>
    </news:news>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/article/${r.slug}"/>
  </url>`);

    // Nepali entry — only if the article actually has a Nepali title
    if (r.title_ne) {
      blocks.push(`  <url>
    <loc>${baseUrl}/ne/article/${r.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escape(siteName)}</news:name>
        <news:language>ne</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escape(r.title_ne)}</news:title>
    </news:news>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/article/${r.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/article/${r.slug}"/>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocks.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import { pool } from "@/lib/db/db";
import { getAllSettings } from "@/lib/cms/settings";
import { listCategories } from "@/lib/content/taxonomy";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const LOCALES = ["en", "ne"] as const;
// Public, indexable static pages. `search` is intentionally excluded — search
// result pages have no canonical content for crawlers and should be noindex.
const STATIC_PAGES = ["latest", "videos", "events", "calendar", "live"];

function hreflang(baseUrl: string, paths: { en: string; ne: string }) {
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${paths.en}"/>`,
    `    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}${paths.ne}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${paths.en}"/>`,
  ].join("\n");
}

export async function GET() {
  let baseUrl = "https://kumarihub.com";
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
  } catch { /* use default */ }

  // Pull live category slugs from the DB (rather than hard-coded).
  let categorySlugs: string[] = [];
  try {
    const cats = await listCategories();
    categorySlugs = cats.map((c) => c.slug);
  } catch { /* empty on error */ }

  let articleRows: Array<{ slug: string; updated_at: string }> = [];
  try {
    const result = await pool.query(
      `SELECT slug, COALESCE(updated_at, created_at) AS updated_at
       FROM article WHERE status = 'published' ORDER BY published_at DESC LIMIT 2000`
    );
    articleRows = result.rows;
  } catch { /* empty on error */ }

  const now = new Date().toISOString();
  const blocks: string[] = [];

  // Home (per locale)
  for (const locale of LOCALES) {
    blocks.push(`  <url>
    <loc>${baseUrl}/${locale}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
${hreflang(baseUrl, { en: "/en", ne: "/ne" })}
  </url>`);
  }

  // Category pages (per locale × per category slug)
  for (const locale of LOCALES) {
    for (const cat of categorySlugs) {
      blocks.push(`  <url>
    <loc>${baseUrl}/${locale}/${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
${hreflang(baseUrl, { en: `/en/${cat}`, ne: `/ne/${cat}` })}
  </url>`);
    }
  }

  // Other static pages (per locale)
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      blocks.push(`  <url>
    <loc>${baseUrl}/${locale}/${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
${hreflang(baseUrl, { en: `/en/${page}`, ne: `/ne/${page}` })}
  </url>`);
    }
  }

  // Articles — emit BOTH locales with reciprocal hreflang
  for (const r of articleRows) {
    const lastmod = r.updated_at ? new Date(r.updated_at).toISOString() : now;
    for (const locale of LOCALES) {
      blocks.push(`  <url>
    <loc>${baseUrl}/${locale}/article/${r.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${hreflang(baseUrl, { en: `/en/article/${r.slug}`, ne: `/ne/article/${r.slug}` })}
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

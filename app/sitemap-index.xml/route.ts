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

  const now = new Date().toISOString();

  const sitemaps = [
    { loc: `${baseUrl}/sitemap.xml`,         lastmod: now },
    { loc: `${baseUrl}/article-sitemap.xml`, lastmod: now },
    { loc: `${baseUrl}/news-sitemap.xml`,    lastmod: now },
    { loc: `${baseUrl}/tags-sitemap.xml`,    lastmod: now },
    { loc: `${baseUrl}/authors-sitemap.xml`, lastmod: now },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((s) => `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

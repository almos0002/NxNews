import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync } from "@/lib/seo/site-url";
import { listTags } from "@/lib/content/taxonomy";

export const revalidate = 3600;

const LOCALES = ["en", "ne"] as const;

export async function GET() {
  let canonical: string | undefined;
  try {
    const s = await getAllSettings() as Record<string, string>;
    canonical = s.seo_canonical_base_url;
  } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(canonical);

  let tags: { slug: string }[] = [];
  try {
    tags = await listTags();
  } catch { /* empty on error */ }

  const now = new Date().toISOString();
  const blocks: string[] = [];

  for (const tag of tags) {
    blocks.push(`  <url>
    <loc>${baseUrl}/en/tags/${tag.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/tags/${tag.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/tags/${tag.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/tags/${tag.slug}"/>
  </url>`);
    blocks.push(`  <url>
    <loc>${baseUrl}/ne/tags/${tag.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/tags/${tag.slug}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}/ne/tags/${tag.slug}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/tags/${tag.slug}"/>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
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

// suppress unused import warning — LOCALES used for type safety elsewhere
void (LOCALES satisfies readonly string[]);

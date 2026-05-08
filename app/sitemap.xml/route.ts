import { getAllSettings } from "@/lib/cms/settings";
import { listCategories } from "@/lib/content/taxonomy";
import { resolveBaseUrlSync } from "@/lib/seo/site-url";

export const revalidate = 3600;

const LOCALES = ["en", "ne"] as const;
const STATIC_PAGES = ["latest", "videos", "events", "calendar", "live"];

function urlBlock(
  baseUrl: string,
  enPath: string,
  nePath: string,
  opts: { lastmod: string; changefreq: string; priority: string }
): string {
  return `  <url>
    <loc>${baseUrl}${enPath}</loc>
    <lastmod>${opts.lastmod}</lastmod>
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${enPath}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}${nePath}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${enPath}"/>
  </url>
  <url>
    <loc>${baseUrl}${nePath}</loc>
    <lastmod>${opts.lastmod}</lastmod>
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${enPath}"/>
    <xhtml:link rel="alternate" hreflang="ne" href="${baseUrl}${nePath}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${enPath}"/>
  </url>`;
}

export async function GET() {
  let canonical: string | undefined;
  try {
    const s = await getAllSettings() as Record<string, string>;
    canonical = s.seo_canonical_base_url;
  } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(canonical);

  let categorySlugs: string[] = [];
  try {
    const cats = await listCategories();
    categorySlugs = cats.map((c) => c.slug);
  } catch { /* empty on error */ }

  const now = new Date().toISOString();
  const blocks: string[] = [];

  // Home
  blocks.push(urlBlock(baseUrl, "/en", "/ne", {
    lastmod: now,
    changefreq: "hourly",
    priority: "1.0",
  }));

  // Category pages
  for (const cat of categorySlugs) {
    blocks.push(urlBlock(baseUrl, `/en/${cat}`, `/ne/${cat}`, {
      lastmod: now,
      changefreq: "hourly",
      priority: "0.8",
    }));
  }

  // Static pages
  for (const page of STATIC_PAGES) {
    blocks.push(urlBlock(baseUrl, `/en/${page}`, `/ne/${page}`, {
      lastmod: now,
      changefreq: "daily",
      priority: "0.6",
    }));
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

// suppress unused import warning
void (LOCALES satisfies readonly string[]);

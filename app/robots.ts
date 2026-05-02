import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync } from "@/lib/seo/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let canonical: string | undefined;
  let noindex = false;
  try {
    const s = await getAllSettings() as Record<string, string>;
    canonical = s.seo_canonical_base_url;
    if (s.seo_robots_noindex === "true") noindex = true;
  } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(canonical);

  return {
    rules: [
      {
        userAgent: "*",
        allow: noindex ? [] : ["/"],
        disallow: ["/api/", "/dashboard/", "/account/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
      `${baseUrl}/article-sitemap.xml`,
    ],
  };
}

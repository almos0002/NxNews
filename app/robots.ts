import type { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/cms/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = "https://kumarihub.com";
  let noindex = false;
  try {
    const s = await getAllSettings() as Record<string, string>;
    if (s.seo_canonical_base_url) baseUrl = s.seo_canonical_base_url.replace(/\/$/, "");
    if (s.seo_robots_noindex === "true") noindex = true;
  } catch { /* use defaults */ }

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

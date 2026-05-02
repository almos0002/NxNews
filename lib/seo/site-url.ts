import { getAllSettings } from "@/lib/cms/settings";

const FALLBACK_BASE_URL = "https://kumarihub.com";

/**
 * Validate + normalize a candidate base URL. Returns the canonicalized
 * `https://host[:port]` form (no trailing slash, no path/search/hash) or
 * `null` if the input is malformed. Forces https on bare hostnames.
 */
function normalizeBaseUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  // Promote bare hostnames (e.g. "example.com") to https.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname) return null;
    return `${u.protocol}//${u.host}`; // host includes port if present
  } catch {
    return null;
  }
}

/**
 * Resolve the public base URL for canonical/OG/sitemap purposes.
 *
 * Resolution order:
 *  1. CMS setting `seo_canonical_base_url` (admin-controlled)
 *  2. `NEXT_PUBLIC_SITE_URL` env (set in production / Replit Deployments)
 *  3. `REPLIT_DEV_DOMAIN` env (auto-set inside the Replit dev sandbox so
 *     link previews work when sharing the live preview URL)
 *  4. Hardcoded fallback `https://kumarihub.com`
 *
 * Each candidate is validated; malformed values are skipped silently so a
 * bad CMS setting can never throw inside `generateMetadata` or break the
 * `new URL()` calls in `metadataBase`.
 *
 * Always returns a URL with NO trailing slash.
 */
export function resolveBaseUrlSync(canonicalSetting?: string): string {
  return (
    normalizeBaseUrl(canonicalSetting) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeBaseUrl(process.env.REPLIT_DEV_DOMAIN) ||
    FALLBACK_BASE_URL
  );
}

/** Async helper that pulls the canonical URL from CMS settings. */
export async function resolveBaseUrl(): Promise<string> {
  const s = await getAllSettings().catch(() => ({} as Record<string, string>));
  return resolveBaseUrlSync(s.seo_canonical_base_url);
}

/** Default OG image dimensions — matches `public/og-default.png`. */
export const OG_DEFAULT_IMAGE = {
  path: "/og-default.png",
  width: 871,
  height: 286,
} as const;

/**
 * Build the default `og:image` URL + dimensions for any page that doesn't
 * have its own cover image (home, listing pages, etc).
 *
 * IMPORTANT: every page's `generateMetadata` MUST emit `openGraph.images`,
 * because in Next.js App Router the page-level `openGraph` object fully
 * replaces (not merges with) the layout-level one. If a page returns an
 * `openGraph` without `images`, no og:image meta tag is rendered at all
 * — and link previews on WhatsApp / iMessage / Slack will silently fail.
 */
export async function getDefaultOgImage(): Promise<{ url: string; width: number; height: number }> {
  const baseUrl = await resolveBaseUrl();
  return {
    url: `${baseUrl}${OG_DEFAULT_IMAGE.path}`,
    width: OG_DEFAULT_IMAGE.width,
    height: OG_DEFAULT_IMAGE.height,
  };
}

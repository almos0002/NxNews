import { getAllSettings } from "./settings";

export const FALLBACK_SITE_NAME = "KumariHub";

export async function getSiteName(locale: string): Promise<string> {
  try {
    const s = await getAllSettings();
    const isNe = locale === "ne";
    return isNe
      ? (s.site_title_ne || s.site_title_en || FALLBACK_SITE_NAME)
      : (s.site_title_en || FALLBACK_SITE_NAME);
  } catch {
    return FALLBACK_SITE_NAME;
  }
}

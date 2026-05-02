import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getAllSettings, setSettings } from "@/lib/cms/settings";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (typeof body !== "object" || !body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    const safe: Record<string, string> = {};
    const ALLOWED_KEYS = [
      "site_title_en","site_title_ne","site_tagline_en","site_tagline_ne",
      "site_description_en","site_description_ne",
      "contact_email","copyright_text","social_twitter","social_facebook",
      "social_instagram","social_youtube","breaking_news_enabled","logo_url","favicon_url",
      "seo_meta_title_template","seo_default_description_en","seo_default_description_ne",
      "seo_og_image_url","seo_canonical_base_url","seo_ga4_id","seo_gsc_verification",
      "seo_bing_verification","seo_yandex_verification","seo_baidu_verification","seo_pinterest_verification",
      "seo_robots_noindex","seo_structured_data_enabled","seo_twitter_card",
    ];
    for (const k of ALLOWED_KEYS) {
      if (typeof body[k] === "string") safe[k] = body[k];
    }
    await setSettings(safe);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/settings]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

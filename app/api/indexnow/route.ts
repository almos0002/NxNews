import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import { resolveBaseUrl } from "@/lib/seo/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const key = process.env.INDEXNOW_KEY;
    if (!key) {
      return NextResponse.json({ error: "INDEXNOW_KEY is not configured." }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const baseUrl = await resolveBaseUrl();

    let urls: string[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      urls = body.urls.map((u: string) =>
        u.startsWith("http") ? u : `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`
      );
    } else {
      urls = [
        `${baseUrl}/en`,
        `${baseUrl}/ne`,
        `${baseUrl}/sitemap.xml`,
      ];
    }

    await submitToIndexNow(urls);
    return NextResponse.json({ ok: true, submitted: urls.length, urls });
  } catch (err) {
    console.error("[POST /api/indexnow]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const key = process.env.INDEXNOW_KEY;
    const baseUrl = await resolveBaseUrl();

    return NextResponse.json({
      configured: !!key,
      key: key ?? null,
      keyFileUrl: key ? `${baseUrl}/${key}.txt` : null,
      endpoint: "https://api.indexnow.org/indexnow",
    });
  } catch (err) {
    console.error("[GET /api/indexnow]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

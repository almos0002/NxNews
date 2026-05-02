import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/db";
import { auth } from "@/lib/auth/auth";
import { createHash } from "crypto";

const ALLOWED_TYPES = ["article", "page", "video", "event", "live"] as const;
type ViewType = typeof ALLOWED_TYPES[number];

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

async function getGeoInfo(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (ip === "0.0.0.0" || ip.startsWith("127.") || ip.startsWith("::1") || ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168.")) {
    return { country: "Local", city: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json() as { status?: string; country?: string; city?: string };
      if (data.status === "success" && data.country) return { country: data.country, city: data.city ?? null };
    }
  } catch { /* fall through */ }
  try {
    const res = await fetch(`https://ipwho.is/${ip}?fields=country,city,success`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json() as { success?: boolean; country?: string; city?: string };
      if (data.success) return { country: data.country ?? null, city: data.city ?? null };
    }
  } catch { /* give up */ }
  return { country: null, city: null };
}

function tableForType(type: ViewType): string | null {
  switch (type) {
    case "article": return "article";
    case "page":    return "pages";
    case "video":   return "videos";
    case "event":   return "event_photos";
    case "live":    return null; // uses global_view_counters
  }
}

// Schema (global_view_counters + seed row) is managed by scripts/schema.sql.

async function getCurrentViewCount(type: ViewType, id: string): Promise<number> {
  if (type === "live") {
    const { rows } = await pool.query("SELECT view_count FROM global_view_counters WHERE id = 'live-page'");
    return rows[0]?.view_count ?? 0;
  }
  const table = tableForType(type)!;
  const { rows } = await pool.query(`SELECT view_count FROM ${table} WHERE id = $1`, [id]);
  return rows[0]?.view_count ?? 0;
}

async function incrementViewCount(type: ViewType, id: string): Promise<number> {
  if (type === "live") {
    const { rows } = await pool.query(
      `INSERT INTO global_view_counters (id, view_count) VALUES ('live-page', 1)
       ON CONFLICT (id) DO UPDATE SET view_count = global_view_counters.view_count + 1
       RETURNING view_count`
    );
    return rows[0]?.view_count ?? 1;
  }
  const table = tableForType(type)!;
  const { rows } = await pool.query(
    `UPDATE ${table} SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count`,
    [id]
  );
  return rows[0]?.view_count ?? 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; id?: string };
    const { type, id } = body;

    if (!type || !id || !ALLOWED_TYPES.includes(type as ViewType)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }
    const vType = type as ViewType;

    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") ?? "";
    const today = new Date().toISOString().slice(0, 10);
    const viewHash = createHash("sha256").update(`${ip}-${type}-${id}-${today}`).digest("hex");

    const existing = await pool.query("SELECT id FROM page_views WHERE view_hash = $1", [viewHash]);

    if (existing.rowCount && existing.rowCount > 0) {
      if (vType === "article") {
        const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
        if (session?.user?.id) {
          pool.query(
            `INSERT INTO reading_history (user_id, article_id, read_at) VALUES ($1, $2, now())
             ON CONFLICT (user_id, article_id) DO UPDATE SET read_at = now()`,
            [session.user.id, id]
          ).catch(() => {});
        }
      }
      const views = await getCurrentViewCount(vType, id);
      return NextResponse.json({ views, isNew: false });
    }

    const { country, city } = await getGeoInfo(ip);

    await pool.query(
      `INSERT INTO page_views (content_type, content_id, ip, country, city, user_agent, view_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (view_hash) DO NOTHING`,
      [type, id, ip, country, city, ua.slice(0, 255), viewHash]
    );

    const views = await incrementViewCount(vType, id);

    if (vType === "article") {
      const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
      if (session?.user?.id) {
        pool.query(
          `INSERT INTO reading_history (user_id, article_id, read_at) VALUES ($1, $2, now())
           ON CONFLICT (user_id, article_id) DO UPDATE SET read_at = now()`,
          [session.user.id, id]
        ).catch(() => {});
      }
    }

    return NextResponse.json({ views, isNew: true, country });
  } catch (err) {
    console.error("[POST /api/views]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as ViewType | null;
    const id = searchParams.get("id");

    if (type && id && ALLOWED_TYPES.includes(type)) {
      const views = await getCurrentViewCount(type, id);
      return NextResponse.json({ views });
    }

    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/views]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

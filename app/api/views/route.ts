import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createHash } from "crypto";

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
    const res = await fetch(`https://ipwho.is/${ip}?fields=country,city,success`, {
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "KumariHub/1.0" },
    });
    if (!res.ok) return { country: null, city: null };
    const data = await res.json() as { success?: boolean; country?: string; city?: string };
    if (!data.success) return { country: null, city: null };
    return { country: data.country ?? null, city: data.city ?? null };
  } catch {
    return { country: null, city: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; id?: string };
    const { type, id } = body;

    if (!type || !id || !["article", "page", "video"].includes(type)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") ?? "";
    const today = new Date().toISOString().slice(0, 10);
    const viewHash = createHash("sha256").update(`${ip}-${type}-${id}-${today}`).digest("hex");

    const existing = await pool.query(
      "SELECT id FROM page_views WHERE view_hash = $1",
      [viewHash]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const countRow = await pool.query(
        `SELECT view_count FROM ${type === "article" ? "article" : type === "page" ? "pages" : "videos"} WHERE id = $1`,
        [id]
      );
      return NextResponse.json({ views: countRow.rows[0]?.view_count ?? 0, isNew: false });
    }

    const { country, city } = await getGeoInfo(ip);

    await pool.query(
      `INSERT INTO page_views (content_type, content_id, ip, country, city, user_agent, view_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (view_hash) DO NOTHING`,
      [type, id, ip, country, city, ua.slice(0, 255), viewHash]
    );

    const table = type === "article" ? "article" : type === "page" ? "pages" : "videos";
    const updated = await pool.query(
      `UPDATE ${table} SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count`,
      [id]
    );

    return NextResponse.json({
      views: updated.rows[0]?.view_count ?? 1,
      isNew: true,
      country,
    });
  } catch (err) {
    console.error("[POST /api/views]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (type && id) {
      const table = type === "article" ? "article" : type === "page" ? "pages" : "videos";
      const row = await pool.query(`SELECT view_count FROM ${table} WHERE id = $1`, [id]);
      return NextResponse.json({ views: row.rows[0]?.view_count ?? 0 });
    }

    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/views]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

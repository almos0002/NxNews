import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const { rows } = await pool.query(
      `SELECT
        pv.id, pv.content_type, pv.content_id, pv.ip, pv.country, pv.city, pv.viewed_at,
        CASE
          WHEN pv.content_type = 'live' THEN 'Live Page'
          ELSE COALESCE(a.title_en, p.title_en, v.title_en, ep.title_en)
        END AS content_title,
        CASE
          WHEN pv.content_type = 'live'  THEN '/live'
          WHEN pv.content_type = 'event' THEN ep.slug
          ELSE COALESCE(a.slug, p.id::text, v.id::text)
        END AS content_slug
       FROM page_views pv
       LEFT JOIN article       a  ON pv.content_type = 'article' AND a.id::text  = pv.content_id
       LEFT JOIN pages         p  ON pv.content_type = 'page'    AND p.id::text  = pv.content_id
       LEFT JOIN videos        v  ON pv.content_type = 'video'   AND v.id::text  = pv.content_id
       LEFT JOIN event_photos  ep ON pv.content_type = 'event'   AND ep.id::text = pv.content_id
       ORDER BY pv.viewed_at DESC
       LIMIT $1`,
      [limit]
    );

    const totalRow = await pool.query("SELECT COUNT(*) AS cnt FROM page_views");
    const uniqueIpRow = await pool.query("SELECT COUNT(DISTINCT ip) AS cnt FROM page_views");
    const countryRow = await pool.query(
      "SELECT country, COUNT(*) AS cnt FROM page_views WHERE country IS NOT NULL GROUP BY country ORDER BY cnt DESC LIMIT 5"
    );

    return NextResponse.json({
      recent: rows,
      total: parseInt(totalRow.rows[0]?.cnt ?? "0", 10),
      uniqueIps: parseInt(uniqueIpRow.rows[0]?.cnt ?? "0", 10),
      topCountries: countryRow.rows,
    });
  } catch (err) {
    console.error("[GET /api/views/recent]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

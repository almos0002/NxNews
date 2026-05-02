import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await pool.query(
    `SELECT b.article_id, b.created_at,
            a.title_en, a.title_ne, a.slug, a.category, a.featured_image
     FROM bookmarks b
     JOIN article a ON a.id = b.article_id
     WHERE b.user_id = $1 AND a.status = 'published'
     ORDER BY b.created_at DESC`,
    [session.user.id]
  );
  return NextResponse.json({ bookmarks: res.rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId } = await req.json() as { articleId?: string };
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const existing = await pool.query(
    "SELECT id FROM bookmarks WHERE user_id = $1 AND article_id = $2",
    [session.user.id, articleId]
  );

  if ((existing.rowCount ?? 0) > 0) {
    await pool.query(
      "DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2",
      [session.user.id, articleId]
    );
    return NextResponse.json({ bookmarked: false });
  } else {
    await pool.query(
      "INSERT INTO bookmarks (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [session.user.id, articleId]
    );
    return NextResponse.json({ bookmarked: true });
  }
}

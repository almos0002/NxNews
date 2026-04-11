import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = await pool.query<{
    id: string; title_en: string; title_ne: string; slug: string;
    category: string; status: string; view_count: number;
    author_name: string | null; published_at: string | null; created_at: string;
  }>(
    `SELECT a.id, a.title_en, a.title_ne, a.slug, a.category, a.status,
            a.view_count, a.published_at, a.created_at,
            u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.is_featured = true
     ORDER BY a.updated_at DESC`
  );

  return NextResponse.json({ articles: res.rows });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { articleId, featured } = await req.json();
  if (!articleId || typeof featured !== "boolean") {
    return NextResponse.json({ error: "articleId and featured are required" }, { status: 400 });
  }

  await pool.query("UPDATE article SET is_featured = $1 WHERE id = $2", [featured, articleId]);
  return NextResponse.json({ ok: true });
}

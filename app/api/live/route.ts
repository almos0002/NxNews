import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, title_en, title_ne, description_en, description_ne,
            stream_url, platform, is_active, display_order, created_at, updated_at
     FROM live_streams ORDER BY display_order ASC, created_at DESC`
  );
  return NextResponse.json({ streams: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title_en, title_ne, description_en, description_ne, stream_url, platform, is_active, display_order } = body;

  if (!title_en?.trim()) return NextResponse.json({ error: "English title required" }, { status: 400 });
  if (!stream_url?.trim()) return NextResponse.json({ error: "Stream URL required" }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO live_streams (title_en, title_ne, description_en, description_ne, stream_url, platform, is_active, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [title_en.trim(), title_ne?.trim() || null, description_en?.trim() || null, description_ne?.trim() || null,
     stream_url.trim(), platform || "youtube", is_active ?? true, display_order ?? 0]
  );
  return NextResponse.json({ stream: rows[0] }, { status: 201 });
}

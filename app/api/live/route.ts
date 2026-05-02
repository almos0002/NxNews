import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS live_streams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title_en TEXT NOT NULL,
      title_ne TEXT,
      description_en TEXT,
      description_ne TEXT,
      stream_url TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'youtube',
      is_active BOOLEAN NOT NULL DEFAULT true,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  await ensureTable();
  const { rows } = await pool.query(
    "SELECT * FROM live_streams ORDER BY display_order ASC, created_at DESC"
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

  await ensureTable();
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

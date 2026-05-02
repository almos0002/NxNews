import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title_en, title_ne, description_en, description_ne, stream_url, platform, is_active, display_order } = body;

  const { rows } = await pool.query(
    `UPDATE live_streams SET
       title_en=$1, title_ne=$2, description_en=$3, description_ne=$4,
       stream_url=$5, platform=$6, is_active=$7, display_order=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [title_en, title_ne || null, description_en || null, description_ne || null,
     stream_url, platform || "youtube", is_active, display_order ?? 0, id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ stream: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await pool.query("DELETE FROM live_streams WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}

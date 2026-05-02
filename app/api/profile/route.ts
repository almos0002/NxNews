import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { rows } = await pool.query(
      `SELECT id, name, email, bio, image, role, "createdAt" FROM "user" WHERE id=$1`,
      [session.user.id]
    );
    return NextResponse.json({ user: rows[0] ?? null });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, bio } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const { rows } = await pool.query(
      `UPDATE "user" SET name=$2, bio=$3, "updatedAt"=NOW() WHERE id=$1
       RETURNING id, name, email, bio, image, role, "createdAt"`,
      [session.user.id, name.trim(), (bio ?? "").trim()]
    );
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

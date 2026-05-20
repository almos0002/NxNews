import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10), 500);
    const page  = Math.max(parseInt(url.searchParams.get("page")  ?? "1",   10), 1);
    const offset = (page - 1) * limit;

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(
        `SELECT id, name, email, role, "createdAt", "banned", "banReason"
         FROM "user" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM "user"`),
    ]);
    return NextResponse.json({ users: rows, total: countRows[0].total, page, limit });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const callerRole = (session.user as { role?: string }).role ?? "user";
    if (callerRole !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/users]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const callerRole = (session.user as { role?: string }).role ?? "user";
    if (callerRole !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, role, banned } = body;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    if (role !== undefined) {
      const validRoles = ["user", "author", "moderator", "admin"];
      if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      await pool.query(`UPDATE "user" SET role=$2 WHERE id=$1`, [userId, role]);
    }

    if (banned !== undefined) {
      await pool.query(
        `UPDATE "user" SET banned=$2, "banReason"=$3 WHERE id=$1`,
        [userId, banned, banned ? "Banned by admin" : null]
      );
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, role, "createdAt", "banned", "banReason" FROM "user" WHERE id=$1`,
      [userId]
    );
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/users]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

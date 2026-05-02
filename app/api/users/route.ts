import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { rows } = await pool.query(
      `SELECT id, name, email, role, "createdAt", "banned", "banReason" FROM "user" ORDER BY "createdAt" DESC`
    );
    return NextResponse.json({ users: rows });
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

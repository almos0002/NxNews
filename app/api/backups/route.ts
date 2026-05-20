import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { generateSqlDump } from "@/lib/db/backup";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    backups: [],
    message: "Backups are generated on demand and downloaded directly. Click 'Create Backup' to download a SQL dump.",
  });
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sql, filename } = await generateSqlDump();
    return new NextResponse(sql, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(Buffer.byteLength(sql, "utf8")),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: "Backups are downloaded directly and not stored on the server.",
  });
}

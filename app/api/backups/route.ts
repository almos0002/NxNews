import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return null;
  return session;
}

function escapeValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
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

  const client = await pool.connect();
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `neon_backup_${timestamp}.sql`;

    const { rows: tables } = await client.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const chunks: string[] = [];

    chunks.push(`-- KumariHub database backup\n`);
    chunks.push(`-- Generated: ${new Date().toISOString()}\n`);
    chunks.push(`-- Tables: ${tables.map((t) => t.tablename).join(", ")}\n\n`);
    chunks.push(`SET client_encoding = 'UTF8';\n`);
    chunks.push(`SET standard_conforming_strings = on;\n\n`);

    for (const { tablename } of tables) {
      const { rows: colRows } = await client.query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tablename]
      );
      const columns = colRows.map((c) => c.column_name);

      const { rows: dataRows } = await client.query(
        `SELECT * FROM "${tablename}"`
      );

      chunks.push(`-- Table: ${tablename} (${dataRows.length} rows)\n`);

      if (dataRows.length === 0) {
        chunks.push(`-- (empty)\n\n`);
        continue;
      }

      const colList = columns.map((c) => `"${c}"`).join(", ");
      for (const row of dataRows) {
        const values = columns.map((c) => escapeValue(row[c])).join(", ");
        chunks.push(`INSERT INTO "${tablename}" (${colList}) VALUES (${values});\n`);
      }
      chunks.push(`\n`);
    }

    const body = chunks.join("");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(Buffer.byteLength(body, "utf8")),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    client.release();
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

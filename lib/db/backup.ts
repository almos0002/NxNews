import { pool } from "@/lib/db/db";
import { PoolClient } from "pg";

function escapeValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

export async function generateSqlDump(client?: PoolClient): Promise<{ sql: string; filename: string }> {
  const owned = !client;
  const conn = client ?? (await pool.connect());

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `neon_backup_${timestamp}.sql`;

    const { rows: tables } = await conn.query<{ tablename: string }>(`
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
      const { rows: colRows } = await conn.query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tablename]
      );
      const columns = colRows.map((c) => c.column_name);
      const { rows: dataRows } = await conn.query(`SELECT * FROM "${tablename}"`);

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

    return { sql: chunks.join(""), filename };
  } finally {
    if (owned) (conn as PoolClient).release();
  }
}

import { pool } from "@/lib/db/db";
import { PoolClient } from "pg";

/**
 * FK-safe insert order: parents before children.
 * Keep in sync with scripts/schema.sql REFERENCES.
 */
export const BACKUP_TABLE_ORDER = [
  "user",
  "categories",
  "tags",
  "settings",
  "ads",
  "pages",
  "menu_items",
  "live_streams",
  "rateLimit",
  "global_view_counters",
  "verification",
  "article",
  "videos",
  "event_photos",
  "account",
  "session",
  "bookmarks",
  "page_views",
  "reading_history",
] as const;

export function tableRestorePriority(table: string): number {
  const idx = (BACKUP_TABLE_ORDER as readonly string[]).indexOf(table);
  return idx === -1 ? BACKUP_TABLE_ORDER.length : idx;
}

export function extractInsertTable(stmt: string): string | null {
  const m = stmt.match(/^INSERT\s+INTO\s+"?([^"(\s]+)"?/i);
  return m?.[1] ?? null;
}

function escapeValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Buffer.isBuffer(val)) return `'\\x${val.toString("hex")}'`;
  if (Array.isArray(val)) {
    if (val.length === 0) return "ARRAY[]::text[]";
    const inner = val.map((v) =>
      v === null || v === undefined
        ? "NULL"
        : `'${String(v).replace(/'/g, "''")}'`
    );
    return `ARRAY[${inner.join(",")}]`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

function sortTables(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const diff = tableRestorePriority(a) - tableRestorePriority(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

export async function generateSqlDump(client?: PoolClient): Promise<{ sql: string; filename: string }> {
  const owned = !client;
  const conn = client ?? (await pool.connect());

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `neon_backup_${timestamp}.sql`;

    const { rows: tableRows } = await conn.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);
    const tables = sortTables(tableRows.map((t) => t.tablename));

    const chunks: string[] = [];
    chunks.push(`-- KumariHub database backup\n`);
    chunks.push(`-- Generated: ${new Date().toISOString()}\n`);
    chunks.push(`-- Tables: ${tables.join(", ")}\n\n`);
    chunks.push(`SET client_encoding = 'UTF8';\n`);
    chunks.push(`SET standard_conforming_strings = on;\n`);
    // Disables FK/trigger checks during restore when the DB role allows it
    chunks.push(`SET session_replication_role = replica;\n\n`);

    for (const tablename of tables) {
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

    chunks.push(`SET session_replication_role = DEFAULT;\n`);

    return { sql: chunks.join(""), filename };
  } finally {
    if (owned) (conn as PoolClient).release();
  }
}

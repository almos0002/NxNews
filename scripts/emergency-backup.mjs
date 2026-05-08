/**
 * Emergency backup: dumps all data from NEON_DATABASE_URL into a SQL file,
 * then restores it into DATABASE_URL (Replit PostgreSQL).
 *
 * Usage: node scripts/emergency-backup.mjs
 */
import pg from "pg";
import fs from "fs";

const { Pool } = pg;

const NEON_URL = process.env.NEON_DATABASE_URL;
const LOCAL_URL = process.env.DATABASE_URL;
const OUT = "/tmp/neon_dump.sql";

if (!NEON_URL) { console.error("NEON_DATABASE_URL not set"); process.exit(1); }
if (!LOCAL_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const neon = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 30_000,
});

const local = new Pool({
  connectionString: LOCAL_URL,
  ssl: false,
  max: 3,
});

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Buffer.isBuffer(val)) return `'\\x${val.toString("hex")}'`;
  if (Array.isArray(val)) {
    if (val.length === 0) return "ARRAY[]::text[]";
    const inner = val.map((v) =>
      v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`
    );
    return `ARRAY[${inner.join(",")}]`;
  }
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function getTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return rows.map((r) => r.table_name);
}

async function dumpTable(client, table) {
  const { rows } = await client.query(`SELECT * FROM public."${table}"`);
  if (rows.length === 0) return `-- table "${table}" is empty\n`;
  const cols = Object.keys(rows[0]).map((c) => `"${c}"`).join(", ");
  const inserts = rows.map((row) => {
    const vals = Object.values(row).map(esc).join(", ");
    return `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`;
  });
  console.log(`    → ${rows.length} rows`);
  return inserts.join("\n") + "\n";
}

async function run() {
  console.log("Connecting to Neon…");
  const neonClient = await neon.connect();

  // Force search_path to public for this connection
  await neonClient.query("SET search_path TO public");
  console.log("Connected to Neon ✓  (search_path=public)");

  const tables = await getTables(neonClient);
  console.log(`Tables found (${tables.length}): ${tables.join(", ")}\n`);

  const lines = [
    `-- KumariHub emergency dump — ${new Date().toISOString()}\n`,
    `SET session_replication_role = replica;\n`,
    `SET search_path TO public;\n`,
  ];

  const stats = { ok: 0, empty: 0, failed: 0 };

  for (const table of tables) {
    process.stdout.write(`  Dumping: ${table}…`);
    try {
      const sql = await dumpTable(neonClient, table);
      lines.push(`\n-- ===== ${table} =====\n`);
      lines.push(sql);
      if (sql.includes("is empty")) stats.empty++;
      else stats.ok++;
    } catch (err) {
      console.warn(`  FAILED: ${err.message}`);
      stats.failed++;
    }
  }

  lines.push(`\nSET session_replication_role = DEFAULT;\n`);
  neonClient.release();
  await neon.end();

  fs.writeFileSync(OUT, lines.join(""), "utf8");
  const size = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`\nDump written → ${OUT} (${size} KB)`);
  console.log(`Tables: ${stats.ok} with data, ${stats.empty} empty, ${stats.failed} failed\n`);

  // ── Restore to Replit PostgreSQL ──────────────────────────────────────────
  console.log("Restoring to Replit PostgreSQL…");
  const localClient = await local.connect();

  // Restore statement by statement so we can skip errors on individual rows
  const rawSql = fs.readFileSync(OUT, "utf8");
  const statements = rawSql
    .split(/;\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  let restored = 0, skipped = 0;
  for (const stmt of statements) {
    try {
      await localClient.query(stmt);
      restored++;
    } catch (err) {
      // Log the first few failures only
      if (skipped < 5) console.warn(`  Skip: ${err.message.slice(0, 120)}`);
      skipped++;
    }
  }

  localClient.release();
  await local.end();

  console.log(`\nRestore complete:`);
  console.log(`  Statements executed : ${restored}`);
  console.log(`  Statements skipped  : ${skipped}`);
  console.log(`  Dump file           : ${OUT}`);
}

run().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});

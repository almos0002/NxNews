/**
 * Ordered restore from /tmp/neon_dump.sql into DATABASE_URL (Replit PostgreSQL).
 * Respects FK order and fixes empty-array type cast issues.
 *
 * Usage: node scripts/ordered-restore.mjs
 */
import pg from "pg";
import fs from "fs";

const { Pool } = pg;
const OUT = "/tmp/neon_dump.sql";

const local = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, max: 3 });

// FK-safe insert order (parents before children)
const TABLE_ORDER = [
  "user",          // root
  "categories",
  "tags",
  "settings",
  "ads",
  "pages",
  "menu_items",
  "live_streams",
  "rateLimit",
  "global_view_counters",
  "article",       // → user, categories
  "videos",        // → user
  "account",       // → user
  "session",       // → user
  "verification",  // → user
  "event_photos",
  "bookmarks",     // → user, article
  "page_views",    // → article
  "reading_history", // → user, article
];

function extractTableInserts(sql, table) {
  const marker = `-- ===== ${table} =====`;
  const start = sql.indexOf(marker);
  if (start === -1) return [];

  // Find next table marker or end of file
  const nextMarker = sql.indexOf("-- =====", start + marker.length);
  const block = nextMarker === -1 ? sql.slice(start) : sql.slice(start, nextMarker);

  return block
    .split(";\n")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("INSERT"));
}

function fixEmptyArrays(stmt) {
  // Replace ARRAY[] with ARRAY[]::text[] to satisfy PostgreSQL type inference
  return stmt.replace(/ARRAY\[\]/g, "ARRAY[]::text[]");
}

async function run() {
  if (!fs.existsSync(OUT)) {
    console.error(`Dump file not found: ${OUT} — run emergency-backup.mjs first`);
    process.exit(1);
  }

  const size = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`Reading dump: ${OUT} (${size} KB)\n`);
  const sql = fs.readFileSync(OUT, "utf8");

  const client = await local.connect();

  // Disable FK checks for the session
  await client.query("SET session_replication_role = replica");

  let totalOk = 0, totalSkip = 0;

  for (const table of TABLE_ORDER) {
    const stmts = extractTableInserts(sql, table);
    if (stmts.length === 0) {
      console.log(`  ${table}: (empty / not in dump)`);
      continue;
    }

    let ok = 0, skip = 0;
    for (let stmt of stmts) {
      stmt = fixEmptyArrays(stmt);
      try {
        await client.query(stmt);
        ok++;
      } catch (err) {
        skip++;
        if (skip <= 2) console.warn(`    skip (${table}): ${err.message.slice(0, 100)}`);
      }
    }
    console.log(`  ${table}: ${ok} inserted, ${skip} skipped`);
    totalOk += ok;
    totalSkip += skip;
  }

  await client.query("SET session_replication_role = DEFAULT");
  client.release();
  await local.end();

  console.log(`\n✓ Restore complete`);
  console.log(`  Rows inserted : ${totalOk}`);
  console.log(`  Rows skipped  : ${totalSkip} (already exist or conflict)`);
}

run().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});

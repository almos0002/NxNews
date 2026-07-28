import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";
import {
  extractInsertTable,
  tableRestorePriority,
} from "@/lib/db/backup";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return null;
  return session;
}

function splitStatements(sql: string): string[] {
  return sql
    .split("\n")
    .map((s) => s.trim())
    .filter((t) => t.startsWith("INSERT INTO") || t.startsWith("SET "));
}

/** Sort INSERTs by FK-safe table order; keep SET statements first. */
function orderStatements(statements: string[]): string[] {
  const sets = statements.filter((s) => s.startsWith("SET "));
  const inserts = statements
    .filter((s) => s.startsWith("INSERT INTO"))
    .sort((a, b) => {
      const ta = extractInsertTable(a) ?? "";
      const tb = extractInsertTable(b) ?? "";
      const diff = tableRestorePriority(ta) - tableRestorePriority(tb);
      return diff !== 0 ? diff : ta.localeCompare(tb);
    });
  return [...sets, ...inserts];
}

function fixEmptyArrays(stmt: string): string {
  return stmt.replace(/ARRAY\[\]/g, "ARRAY[]::text[]");
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_BACKUP_TOKEN;
  const repo = process.env.GITHUB_BACKUP_REPO;

  if (!token || !repo) {
    return NextResponse.json({ error: "GitHub backup is not configured." }, { status: 503 });
  }

  const { filename } = await params;

  if (!filename.startsWith("neon_backup_") || !filename.endsWith(".sql")) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const metaRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/backups/${filename}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!metaRes.ok) {
    return NextResponse.json({ error: "File not found on GitHub." }, { status: 404 });
  }

  const meta: { download_url: string } = await metaRes.json();

  const fileRes = await fetch(meta.download_url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fileRes.ok) {
    return NextResponse.json({ error: "Failed to fetch backup from GitHub." }, { status: 502 });
  }

  const sql = await fileRes.text();
  const statements = orderStatements(splitStatements(sql));

  if (statements.filter((s) => s.startsWith("INSERT")).length === 0) {
    return NextResponse.json({ error: "No INSERT statements found in backup file." }, { status: 400 });
  }

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;
  const errorMessages: string[] = [];

  try {
    await client.query("BEGIN");

    // Best-effort: skip FK/trigger checks if the role allows it (Neon often does not).
    await client.query("SET LOCAL session_replication_role = replica").catch(() => {});

    for (const stmt of statements) {
      if (stmt.startsWith("SET ")) {
        // Ignore dump-level SET session_replication_role — we handle it above.
        if (/session_replication_role/i.test(stmt)) continue;
        await client.query(stmt).catch(() => {});
        continue;
      }

      const safeStmt = fixEmptyArrays(
        stmt.endsWith(";")
          ? stmt.slice(0, -1) + " ON CONFLICT DO NOTHING;"
          : stmt + " ON CONFLICT DO NOTHING;"
      );

      // SAVEPOINT so one failed INSERT does not abort the whole transaction
      await client.query("SAVEPOINT restore_row");
      try {
        const result = await client.query(safeStmt);
        await client.query("RELEASE SAVEPOINT restore_row");
        if (result.rowCount && result.rowCount > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (err) {
        await client.query("ROLLBACK TO SAVEPOINT restore_row");
        skipped++;
        const msg = err instanceof Error ? err.message : String(err);
        if (errorMessages.length < 5) errorMessages.push(msg);
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    const msg = err instanceof Error ? err.message : "Restore failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({
    ok: true,
    filename,
    total: statements.filter((s) => s.startsWith("INSERT")).length,
    inserted,
    skipped,
    errors: errorMessages,
  });
}

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

function splitStatements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      return t.startsWith("INSERT INTO") || t.startsWith("SET ");
    })
    .map((s) => s.trim())
    .filter(Boolean);
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

  // Fetch file metadata from GitHub
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
  const statements = splitStatements(sql);

  if (statements.length === 0) {
    return NextResponse.json({ error: "No INSERT statements found in backup file." }, { status: 400 });
  }

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;
  const errorMessages: string[] = [];

  try {
    await client.query("BEGIN");

    for (const stmt of statements) {
      if (stmt.startsWith("SET ")) {
        await client.query(stmt).catch(() => {});
        continue;
      }

      try {
        // Add ON CONFLICT DO NOTHING so existing rows are skipped cleanly
        const safeStmt = stmt.endsWith(";")
          ? stmt.slice(0, -1) + " ON CONFLICT DO NOTHING;"
          : stmt + " ON CONFLICT DO NOTHING;";
        const result = await client.query(safeStmt);
        if (result.rowCount && result.rowCount > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (err) {
        skipped++;
        const msg = err instanceof Error ? err.message : String(err);
        if (errorMessages.length < 5) errorMessages.push(msg);
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
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

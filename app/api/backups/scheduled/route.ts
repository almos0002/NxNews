import { NextResponse } from "next/server";
import { generateSqlDump } from "@/lib/db/backup";
import { commitBackupToGitHub, deleteOldBackups } from "@/lib/github/backup";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GITHUB_BACKUP_TOKEN) {
    return NextResponse.json({ error: "GITHUB_BACKUP_TOKEN is not set." }, { status: 500 });
  }
  if (!process.env.GITHUB_BACKUP_REPO) {
    return NextResponse.json({ error: "GITHUB_BACKUP_REPO is not set." }, { status: 500 });
  }

  try {
    const { sql, filename } = await generateSqlDump();
    const { url, sha } = await commitBackupToGitHub(filename, sql);
    const deleted = await deleteOldBackups(7);

    console.log(`[backup] Committed ${filename} to GitHub (sha: ${sha}). Deleted ${deleted} old backup(s).`);

    return NextResponse.json({
      ok: true,
      filename,
      githubUrl: url,
      sha,
      deletedOldBackups: deleted,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scheduled backup failed";
    console.error("[backup] Scheduled backup error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

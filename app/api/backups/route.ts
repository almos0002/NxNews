import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);
const BACKUP_DIR = path.join(process.cwd(), "backups");
const SCRIPT = path.join(process.cwd(), "scripts", "backup.sh");

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
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backups = await Promise.all(
      files
        .filter((f) => f.startsWith("neon_backup_") && f.endsWith(".dump"))
        .map(async (filename) => {
          const stat = await fs.stat(path.join(BACKUP_DIR, filename));
          return {
            filename,
            size: stat.size,
            createdAt: stat.mtime.toISOString(),
          };
        })
    );
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ backups });
  } catch {
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { stdout, stderr } = await execFileAsync("bash", [SCRIPT], {
      env: process.env as Record<string, string>,
      timeout: 120_000,
    });
    const output = (stdout + stderr).trim();
    const match = output.match(/Saved (neon_backup_\S+\.dump)/);
    const filename = match ? path.basename(match[1]) : null;
    return NextResponse.json({ ok: true, filename, output });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { filename } = await req.json();
  if (!filename || typeof filename !== "string" || !filename.match(/^neon_backup_[\w]+\.dump$/)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  try {
    await fs.unlink(path.join(BACKUP_DIR, filename));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete backup" }, { status: 500 });
  }
}

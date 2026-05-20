import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") return null;
  return session;
}

export async function GET(
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
    return NextResponse.json({ error: "Failed to download file from GitHub." }, { status: 502 });
  }

  const content = await fileRes.text();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/sql; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(Buffer.byteLength(content, "utf8")),
    },
  });
}

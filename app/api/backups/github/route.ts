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

export interface GitHubBackupFile {
  name: string;
  size: number;
  sha: string;
  downloadUrl: string;
  date: string | null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_BACKUP_TOKEN;
  const repo = process.env.GITHUB_BACKUP_REPO;

  if (!token || !repo) {
    return NextResponse.json(
      { error: "GitHub backup is not configured. Add GITHUB_BACKUP_TOKEN and GITHUB_BACKUP_REPO secrets." },
      { status: 503 }
    );
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/backups`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
  });

  if (res.status === 404) {
    return NextResponse.json({ backups: [] });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "GitHub API error" },
      { status: res.status }
    );
  }

  const files: Array<{
    name: string;
    size: number;
    sha: string;
    download_url: string;
  }> = await res.json();

  const backups: GitHubBackupFile[] = files
    .filter((f) => f.name.startsWith("neon_backup_") && f.name.endsWith(".sql"))
    .map((f) => {
      const match = f.name.match(/neon_backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
      const date = match
        ? new Date(match[1].replace(/T(\d{2})-(\d{2})-(\d{2})/, "T$1:$2:$3")).toISOString()
        : null;
      return {
        name: f.name,
        size: f.size,
        sha: f.sha,
        downloadUrl: f.download_url,
        date,
      };
    })
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return NextResponse.json({ backups });
}

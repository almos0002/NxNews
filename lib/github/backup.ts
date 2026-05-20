const GITHUB_API = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_BACKUP_TOKEN;
  const repo = process.env.GITHUB_BACKUP_REPO;
  if (!token) throw new Error("GITHUB_BACKUP_TOKEN is not set.");
  if (!repo) throw new Error("GITHUB_BACKUP_REPO is not set.");
  return { token, repo };
}

async function githubFetch(path: string, options: RequestInit = {}) {
  const { token } = getConfig();
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  return res;
}

export async function commitBackupToGitHub(
  filename: string,
  content: string
): Promise<{ url: string; sha: string }> {
  const { repo } = getConfig();
  const filePath = `backups/${filename}`;
  const encoded = Buffer.from(content, "utf8").toString("base64");

  // Check if file already exists (to get its SHA for update)
  let sha: string | undefined;
  const existing = await githubFetch(`/repos/${repo}/contents/${filePath}`);
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const body: Record<string, string> = {
    message: `chore: database backup ${filename}`,
    content: encoded,
    branch: "main",
  };
  if (sha) body.sha = sha;

  const res = await githubFetch(`/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub API error ${res.status}: ${(err as { message?: string }).message ?? res.statusText}`
    );
  }

  const data = await res.json();
  return {
    url: data.content?.html_url ?? `https://github.com/${repo}/blob/main/${filePath}`,
    sha: data.content?.sha ?? "",
  };
}

export async function deleteOldBackups(keepDays: number = 7): Promise<number> {
  const { repo } = getConfig();
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;

  const res = await githubFetch(`/repos/${repo}/contents/backups`);
  if (!res.ok) return 0;

  const files: Array<{ name: string; sha: string; path: string }> = await res.json();
  let deleted = 0;

  for (const file of files) {
    if (!file.name.startsWith("neon_backup_") || !file.name.endsWith(".sql")) continue;

    // Extract timestamp from filename: neon_backup_YYYY-MM-DDTHH-MM-SS.sql
    const match = file.name.match(/neon_backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
    if (!match) continue;

    const fileDate = new Date(match[1].replace(/T(\d{2})-(\d{2})-(\d{2})/, "T$1:$2:$3")).getTime();
    if (fileDate < cutoff) {
      await githubFetch(`/repos/${repo}/contents/${file.path}`, {
        method: "DELETE",
        body: JSON.stringify({
          message: `chore: remove old backup ${file.name}`,
          sha: file.sha,
          branch: "main",
        }),
      });
      deleted++;
    }
  }

  return deleted;
}

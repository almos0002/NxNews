/**
 * GitHub backup scheduler — pushes a SQL dump to GitHub every 12 hours.
 * Calls GET /api/backups/scheduled on the local Next.js server using CRON_SECRET.
 * Old backups are cleaned up server-side based on BACKUP_KEEP_DAYS (default 14).
 */

const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getBaseUrl() {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "http://localhost:5000";
}

async function runGitHubBackup() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[github-backup] CRON_SECRET is not set — skipping.");
    return;
  }
  if (!process.env.GITHUB_BACKUP_TOKEN) {
    console.error("[github-backup] GITHUB_BACKUP_TOKEN is not set — skipping.");
    return;
  }
  if (!process.env.GITHUB_BACKUP_REPO) {
    console.error("[github-backup] GITHUB_BACKUP_REPO is not set — skipping.");
    return;
  }

  const url = `${getBaseUrl()}/api/backups/scheduled`;
  const now = new Date().toISOString();
  console.log(`[github-backup] Running at ${now} → ${url}`);

  // Retry up to 3 times in case the server is briefly busy
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(120_000), // 2 min max
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const keepDays = process.env.BACKUP_KEEP_DAYS ?? "14";
        console.log(
          `[github-backup] ✓ Pushed ${data.filename ?? "backup"} to GitHub.` +
          ` Deleted ${data.deletedOldBackups ?? 0} backup(s) older than ${keepDays} days.`
        );
        return;
      }

      console.error(
        `[github-backup] Attempt ${attempt}/3 failed (HTTP ${res.status}): ${data.error ?? "unknown error"}`
      );
    } catch (err) {
      console.error(`[github-backup] Attempt ${attempt}/3 error: ${err.message}`);
    }

    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 10_000)); // wait 10s before retry
    }
  }

  console.error("[github-backup] All 3 attempts failed. Will retry in 12 hours.");
}

// Wait 30s on first start so Next.js has time to be fully ready
console.log("[github-backup] Scheduler started. First run in 30 seconds…");
setTimeout(() => {
  runGitHubBackup();
  setInterval(runGitHubBackup, INTERVAL_MS);
}, 30_000);

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";
import bStyles from "./BackupClient.module.css";

function IconDatabase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

export default function BackupClient() {
  const [creating, setCreating] = useState(false);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  async function createBackup() {
    setCreating(true);
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Backup failed", "error");
        return;
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `neon_backup_${Date.now()}.sql`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLastDownloaded(filename);
      toast("Backup downloaded successfully.", "success");
    } catch {
      toast("Backup failed. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Database Backups</h1>
          <p className={styles.pageSubtitle}>
            Generate a full SQL dump of your database and download it to your computer.
          </p>
        </div>
        <div className={bStyles.headerActions}>
          <button
            className={styles.submitBtn}
            onClick={createBackup}
            disabled={creating}
          >
            <IconDownload />
            {creating ? "Generating backup…" : "Download Backup"}
          </button>
        </div>
      </div>

      <div className={bStyles.infoCard}>
        <div className={bStyles.infoIcon}>
          <IconDatabase />
        </div>
        <div className={bStyles.infoText}>
          <strong>How backups work</strong>
          <p>
            Clicking &ldquo;Download Backup&rdquo; generates a complete SQL dump of all your
            database tables and downloads it directly to your computer as a <code>.sql</code> file.
            Store these files somewhere safe — Dropbox, a USB drive, or a local folder.
          </p>
          {lastDownloaded && (
            <p className={bStyles.lastDownloaded}>
              Last downloaded: <code>{lastDownloaded}</code>
            </p>
          )}
        </div>
      </div>

      <div className={bStyles.tipsCard}>
        <h3 className={bStyles.tipsTitle}>Restore instructions</h3>
        <ol className={bStyles.tipsList}>
          <li>Connect to your Neon database using <code>psql</code> or a GUI tool.</li>
          <li>Run: <code>psql &quot;your_database_url&quot; -f neon_backup_*.sql</code></li>
          <li>All rows will be re-inserted. Run on a fresh database to avoid duplicates.</li>
        </ol>
      </div>
    </div>
  );
}

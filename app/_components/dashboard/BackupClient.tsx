"use client";

import { useState, useEffect, useCallback } from "react";
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

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}
    >
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

interface GitHubBackupFile {
  name: string;
  size: number;
  sha: string;
  downloadUrl: string;
  date: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function BackupClient() {
  const [pushing, setPushing] = useState(false);
  const [backups, setBackups] = useState<GitHubBackupFile[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/backups/github");
      const data = await res.json();
      if (!res.ok) {
        setHistoryError(data.error ?? "Failed to load backup history.");
      } else {
        setBackups(data.backups);
      }
    } catch {
      setHistoryError("Could not reach the server.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function pushToGitHub() {
    setPushing(true);
    try {
      const res = await fetch("/api/backups/github", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Push failed.", "error");
        return;
      }
      toast(`Pushed ${data.filename} to GitHub.`, "success");
      await loadHistory();
    } catch {
      toast("Push failed. Please try again.", "error");
    } finally {
      setPushing(false);
    }
  }

  async function downloadFromGitHub(filename: string) {
    setDownloading(filename);
    try {
      const res = await fetch(`/api/backups/github/${encodeURIComponent(filename)}`);
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Download failed.", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast(`Downloaded ${filename}`, "success");
    } catch {
      toast("Download failed. Please try again.", "error");
    } finally {
      setDownloading(null);
    }
  }

  const totalSize = backups?.reduce((sum, b) => sum + b.size, 0) ?? 0;
  const latestDate = backups?.[0]?.date ?? null;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
            <h1 className={styles.pageTitle}>Database Backups</h1>
            <p className={styles.pageSubtitle}>
              Generate and download SQL dumps, or restore from a past GitHub backup.
            </p>
          </div>
          <div className={bStyles.headerActions}>
            <button
              className={bStyles.refreshBtn}
              onClick={loadHistory}
              disabled={loadingHistory}
              title="Refresh history"
            >
              <IconRefresh spinning={loadingHistory} />
            </button>
            <button
              className={styles.submitBtn}
              onClick={pushToGitHub}
              disabled={pushing}
            >
              {pushing ? <IconRefresh spinning /> : <IconUpload />}
              {pushing ? "Pushing…" : "Push to GitHub"}
            </button>
          </div>
        </div>

        {backups && backups.length > 0 && (
          <div className={bStyles.statsRow}>
            <div className={bStyles.statCard}>
              <span className={bStyles.statLabel}>Total Backups</span>
              <span className={bStyles.statValue}>{backups.length}</span>
            </div>
            <div className={bStyles.statCard}>
              <span className={bStyles.statLabel}>Total Size</span>
              <span className={bStyles.statValue}>{formatSize(totalSize)}</span>
            </div>
            <div className={bStyles.statCard}>
              <span className={bStyles.statLabel}>Latest Backup</span>
              <span className={bStyles.statValue}>{latestDate ? timeAgo(latestDate) : "—"}</span>
            </div>
            <div className={bStyles.statCard}>
              <span className={bStyles.statLabel}>Avg Size</span>
              <span className={bStyles.statValue}>{formatSize(Math.round(totalSize / backups.length))}</span>
            </div>
          </div>
        )}

        <div className={bStyles.historyCard}>
          <div className={bStyles.historyHeader}>
            <div className={bStyles.historyTitleRow}>
              <IconGitHub />
              <span className={bStyles.historyTitle}>GitHub Backup History</span>
            </div>
            {backups && backups.length > 0 && (
              <span className={bStyles.historyCount}>{backups.length} backups</span>
            )}
          </div>

          {loadingHistory && !backups && (
            <div className={bStyles.historyLoading}>
              <span className={bStyles.loadingDots}>Loading backups…</span>
            </div>
          )}

          {historyError && (
            <div className={bStyles.historyError}>
              <strong>Could not load backup history:</strong> {historyError}
            </div>
          )}

          {!loadingHistory && !historyError && backups && backups.length === 0 && (
            <div className={bStyles.historyEmpty}>
              No backups found in the GitHub repository yet. Backups are pushed automatically every day, or you can set one up manually.
            </div>
          )}

          {backups && backups.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup, i) => (
                  <tr key={backup.sha}>
                    <td>
                      <div className={bStyles.filenameCell}>
                        <span className={bStyles.filename}>{backup.name}</span>
                        {i === 0 && <span className={bStyles.latestBadge}>Latest</span>}
                      </div>
                    </td>
                    <td>
                      <span className={bStyles.dateWithIcon}>
                        {formatDate(backup.date)}
                        {backup.date && (
                          <span className={bStyles.timeAgo}>· {timeAgo(backup.date)}</span>
                        )}
                      </span>
                    </td>
                    <td>{formatSize(backup.size)}</td>
                    <td>
                      <div className={`${styles.actionRow} ${bStyles.actionRowRight}`}>
                        <button
                          className={styles.editBtn}
                          title="Download this backup"
                          onClick={() => downloadFromGitHub(backup.name)}
                          disabled={downloading === backup.name}
                        >
                          {downloading === backup.name
                            ? <IconRefresh spinning />
                            : <IconDownload />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        <div className={bStyles.tipsCard}>
          <h3 className={bStyles.tipsTitle}>Restore instructions</h3>
          <ol className={bStyles.tipsList}>
            <li>Download any backup using the button above.</li>
            <li>Connect to your Neon database using <code>psql</code> or a GUI tool.</li>
            <li>Run: <code>psql &quot;your_database_url&quot; -f neon_backup_*.sql</code></li>
            <li>All rows will be re-inserted. Run on a fresh database to avoid duplicates.</li>
          </ol>
        </div>
      </div>
    </>
  );
}

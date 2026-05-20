"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";
import bStyles from "./BackupClient.module.css";

interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function BackupClient() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backups");
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to load backups", "error"); return; }
      setBackups(data.backups);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBackups(); }, [loadBackups]);

  async function createBackup() {
    setCreating(true);
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Backup failed", "error"); return; }
      toast("Backup created successfully.", "success");
      await loadBackups();
    } finally {
      setCreating(false);
    }
  }

  async function deleteBackup(filename: string) {
    if (!confirm(`Delete ${filename}? This cannot be undone.`)) return;
    setDeletingFile(filename);
    try {
      const res = await fetch("/api/backups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Delete failed", "error"); return; }
      toast("Backup deleted.", "success");
      setBackups((prev) => prev.filter((b) => b.filename !== filename));
    } finally {
      setDeletingFile(null);
    }
  }

  async function downloadBackup(filename: string) {
    setDownloadingFile(filename);
    try {
      const res = await fetch(`/api/backups/${encodeURIComponent(filename)}`);
      if (!res.ok) { toast("Download failed", "error"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingFile(null);
    }
  }

  const totalSize = backups.reduce((acc, b) => acc + b.size, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Database Backups</h1>
          <p className={styles.pageSubtitle}>
            Neon database backups — auto-runs daily, or trigger one manually below.
          </p>
        </div>
        <div className={bStyles.headerActions}>
          <button
            className={styles.actionBtn}
            onClick={loadBackups}
            disabled={loading}
            title="Refresh list"
          >
            <IconRefresh /> Refresh
          </button>
          <button
            className={styles.submitBtn}
            onClick={createBackup}
            disabled={creating}
          >
            {creating ? "Creating backup…" : "Backup Now"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={bStyles.statsRow}>
        <div className={bStyles.statCard}>
          <span className={bStyles.statLabel}>Total Backups</span>
          <span className={bStyles.statValue}>{backups.length}</span>
        </div>
        <div className={bStyles.statCard}>
          <span className={bStyles.statLabel}>Total Size</span>
          <span className={bStyles.statValue}>{formatBytes(totalSize)}</span>
        </div>
        <div className={bStyles.statCard}>
          <span className={bStyles.statLabel}>Latest Backup</span>
          <span className={bStyles.statValue}>
            {backups[0] ? formatDate(backups[0].createdAt) : "—"}
          </span>
        </div>
        <div className={bStyles.statCard}>
          <span className={bStyles.statLabel}>Retention</span>
          <span className={bStyles.statValue}>7 days</span>
        </div>
      </div>

      {/* Backup list */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><IconDatabase /> &nbsp;Filename</th>
              <th>Size</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>Loading backups…</td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>No backups yet. Click "Backup Now" to create one.</td>
              </tr>
            ) : (
              backups.map((b, i) => (
                <tr key={b.filename}>
                  <td>
                    <div className={bStyles.filenameCell}>
                      <span className={bStyles.filename}>{b.filename}</span>
                      {i === 0 && <span className={bStyles.latestBadge}>latest</span>}
                    </div>
                  </td>
                  <td className={styles.dateCell}>{formatBytes(b.size)}</td>
                  <td className={styles.dateCell}>
                    <span className={bStyles.dateWithIcon}>
                      <IconClock /> {formatDate(b.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className={`${styles.actionRow} ${bStyles.actionRowRight}`}>
                      <button
                        className={styles.editBtn}
                        onClick={() => downloadBackup(b.filename)}
                        disabled={downloadingFile === b.filename}
                        title="Download backup"
                      >
                        <IconDownload />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteBackup(b.filename)}
                        disabled={deletingFile === b.filename}
                        title="Delete backup"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className={bStyles.footerNote}>
        Backups older than 7 days are automatically removed by the daily scheduler.
      </p>
    </div>
  );
}

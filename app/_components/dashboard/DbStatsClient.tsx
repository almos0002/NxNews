"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";
import s from "./DbStatsClient.module.css";

interface QueryRow {
  query: string;
  calls: number;
  total_ms: number;
  mean_ms: number;
  max_ms: number;
  rows: number;
  shared_blks_hit: number;
  shared_blks_read: number;
}

interface Summary {
  trackedQueries: number;
  totalCalls: number;
  totalExecSec: number;
  cacheHitPct: number | null;
}

function latencyClass(ms: number): string {
  if (ms >= 200) return s.bad;
  if (ms >= 50)  return s.warn;
  return s.good;
}

function latencyLabel(ms: number): string {
  if (ms >= 200) return "slow";
  if (ms >= 50)  return "moderate";
  return "fast";
}

function fmtMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

function IconActivity() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
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

function IconReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
    </svg>
  );
}

export default function DbStatsClient() {
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/db-stats");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load stats"); return; }
      setQueries(data.queries);
      setSummary(data.summary);
    } catch {
      setError("Network error — could not reach the API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resetStats() {
    if (!confirm("Reset all pg_stat_statements counters? This clears the history.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/db-stats", { method: "DELETE" });
      if (!res.ok) { toast("Reset failed", "error"); return; }
      toast("Stats reset.", "success");
      await load();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Query Performance</h1>
          <p className={styles.pageSubtitle}>
            Top 30 slowest queries tracked by <code>pg_stat_statements</code> — sorted by average execution time.
          </p>
        </div>
        <div className={s.headerActions}>
          <button className={styles.actionBtn} onClick={load} disabled={loading}>
            <IconRefresh /> Refresh
          </button>
          <button className={s.resetBtn} onClick={resetStats} disabled={resetting || loading}>
            <IconReset /> {resetting ? "Resetting…" : "Reset Stats"}
          </button>
        </div>
      </div>

      {summary && (
        <div className={s.summaryRow}>
          <div className={s.statCard}>
            <span className={s.statLabel}>Tracked Queries</span>
            <span className={s.statValue}>{fmtNum(summary.trackedQueries)}</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Total Calls</span>
            <span className={s.statValue}>{fmtNum(summary.totalCalls)}</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Total DB Time</span>
            <span className={s.statValue}>{summary.totalExecSec.toFixed(1)}s</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Buffer Cache Hit</span>
            <span className={`${s.statValue} ${
              summary.cacheHitPct === null ? "" :
              summary.cacheHitPct >= 95 ? s.good :
              summary.cacheHitPct >= 80 ? s.warn : s.bad
            }`}>
              {summary.cacheHitPct !== null ? `${summary.cacheHitPct}%` : "—"}
            </span>
          </div>
        </div>
      )}

      {error ? (
        <div className={s.errorBox}>
          <strong>Could not load stats:</strong> {error}
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={`${styles.table} ${s.queryTable}`}>
            <thead>
              <tr>
                <th style={{ width: "42%" }}><IconActivity />&nbsp; Query</th>
                <th>Calls</th>
                <th>Avg</th>
                <th>Max</th>
                <th>Total</th>
                <th>Rows/call</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.emptyRow}>Loading query stats…</td></tr>
              ) : queries.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyRow}>No data yet — queries will appear after the app handles some requests.</td></tr>
              ) : queries.map((q, i) => {
                const rowsPerCall = q.calls > 0 ? (q.rows / q.calls).toFixed(1) : "—";
                const isExpanded = expanded === i;
                return (
                  <tr
                    key={i}
                    className={s.queryRow}
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    <td>
                      <div className={s.queryCell}>
                        <span className={`${s.latencyPip} ${latencyClass(q.mean_ms)}`} title={latencyLabel(q.mean_ms)} />
                        <span className={`${s.queryText} ${isExpanded ? s.queryExpanded : ""}`}>
                          {q.query}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.dateCell} ${s.numCell}`}>{fmtNum(q.calls)}</td>
                    <td className={`${styles.dateCell} ${s.numCell} ${latencyClass(q.mean_ms)}`}>
                      {fmtMs(q.mean_ms)}
                    </td>
                    <td className={`${styles.dateCell} ${s.numCell} ${latencyClass(q.max_ms)}`}>
                      {fmtMs(q.max_ms)}
                    </td>
                    <td className={`${styles.dateCell} ${s.numCell}`}>{fmtMs(q.total_ms)}</td>
                    <td className={`${styles.dateCell} ${s.numCell}`}>{rowsPerCall}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className={s.footerNote}>
        Stats accumulate since last reset or server restart. Green = &lt;50ms, amber = 50–200ms, red = &gt;200ms average.
      </p>
    </div>
  );
}

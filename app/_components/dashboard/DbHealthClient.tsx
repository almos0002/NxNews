"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import s from "./DbHealthClient.module.css";

function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

interface PoolStats { total: number; idle: number; waiting: number }

interface PoolResult {
  status: "ok" | "error";
  latencyMs: number | null;
  serverVersion: string | null;
  error: string | null;
  pool: PoolStats;
}

interface HealthData {
  healthy: boolean;
  checkedAt: string;
  replicaConfigured: boolean;
  primary: PoolResult;
  replica: PoolResult | { note: string };
}

function isPoolResult(r: unknown): r is PoolResult {
  return typeof r === "object" && r !== null && "status" in r;
}

function latencyClass(ms: number | null): string {
  if (ms === null) return s.unknown;
  if (ms < 50) return s.good;
  if (ms < 200) return s.warn;
  return s.bad;
}

function latencyLabel(ms: number | null): string {
  if (ms === null) return "—";
  return `${ms} ms`;
}

function StatusDot({ status }: { status: "ok" | "error" | "loading" }) {
  return (
    <span
      className={`${s.dot} ${status === "ok" ? s.dotOk : status === "error" ? s.dotBad : s.dotLoading}`}
      aria-hidden="true"
    />
  );
}

function PoolCard({ label, result, badge }: {
  label: string;
  result: PoolResult | { note: string };
  badge?: string;
}) {
  if (!isPoolResult(result)) {
    return (
      <div className={s.poolCard}>
        <div className={s.poolCardHeader}>
          <IconDatabase />
          <span className={s.poolLabel}>{label}</span>
          {badge && <span className={s.badge}>{badge}</span>}
        </div>
        <p className={s.noteText}>{result.note}</p>
      </div>
    );
  }

  const isOk = result.status === "ok";

  return (
    <div className={`${s.poolCard} ${isOk ? s.poolCardOk : s.poolCardError}`}>
      <div className={s.poolCardHeader}>
        <StatusDot status={result.status} />
        <span className={s.poolLabel}>{label}</span>
        {badge && <span className={s.badge}>{badge}</span>}
        <span className={`${s.statusText} ${isOk ? s.good : s.bad}`}>
          {isOk ? "Healthy" : "Error"}
        </span>
      </div>

      {!isOk && result.error && (
        <div className={s.errorRow}>{result.error}</div>
      )}

      <div className={s.metricsGrid}>
        <div className={s.metric}>
          <span className={s.metricLabel}>Latency</span>
          <span className={`${s.metricValue} ${latencyClass(result.latencyMs)}`}>
            {latencyLabel(result.latencyMs)}
          </span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>Version</span>
          <span className={s.metricValue}>{result.serverVersion ?? "—"}</span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>Connections</span>
          <span className={s.metricValue}>{result.pool.total}</span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>Idle</span>
          <span className={s.metricValue}>{result.pool.idle}</span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>Waiting</span>
          <span className={`${s.metricValue} ${result.pool.waiting > 0 ? s.warn : ""}`}>
            {result.pool.waiting}
          </span>
        </div>
      </div>

      {isOk && result.latencyMs !== null && (
        <div className={s.latencyBar}>
          <div
            className={`${s.latencyFill} ${latencyClass(result.latencyMs)}`}
            style={{ width: `${Math.min(100, (result.latencyMs / 300) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

const POLL_INTERVAL = 30_000;

export default function DbHealthClient() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);

  const fetch_ = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/db-health");
      if (res.status === 403) { setError("Admin access required."); return; }
      const json = await res.json() as HealthData;
      setData(json);
      setLastRefreshed(new Date());
      setCountdown(POLL_INTERVAL / 1000);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  useEffect(() => {
    const poll = setInterval(() => fetch_(), POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetch_]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [lastRefreshed]);

  const overallStatus = loading && !data
    ? "loading"
    : error
    ? "error"
    : data?.healthy
    ? "ok"
    : "error";

  return (
    <div className={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Database Health</h1>
          <p className={styles.pageSubtitle}>Live status of your primary and read-replica database pools.</p>
        </div>
        <div className={s.headerActions}>
          <span className={s.countdown}>
            <IconActivity />
            Next check in {countdown}s
          </span>
          <button
            className={s.refreshBtn}
            onClick={() => fetch_(true)}
            disabled={loading}
            title="Refresh now"
          >
            <IconRefresh spinning={loading} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={s.errorBanner}>{error}</div>
      )}

      {/* Overall status banner */}
      {data && (
        <div className={`${s.overallBanner} ${data.healthy ? s.overallOk : s.overallBad}`}>
          <StatusDot status={overallStatus === "loading" ? "loading" : overallStatus} />
          <span className={s.overallText}>
            {data.healthy ? "All systems operational" : "One or more pools are reporting errors"}
          </span>
          {lastRefreshed && (
            <span className={s.overallTs}>
              Last checked {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Pool cards */}
      {data && (
        <div className={s.poolGrid}>
          <PoolCard
            label="Primary Pool"
            result={data.primary}
            badge="Read / Write"
          />
          <PoolCard
            label="Read Replica Pool"
            result={data.replica}
            badge={data.replicaConfigured ? "Read Only" : "Not configured"}
          />
        </div>
      )}

      {/* Skeleton while first load */}
      {loading && !data && (
        <div className={s.poolGrid}>
          {[0, 1].map((i) => (
            <div key={i} className={`${s.poolCard} ${s.skeleton}`} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className={s.legend}>
        <span className={s.legendItem}><span className={`${s.pip} ${s.good}`} /> &lt; 50 ms — Fast</span>
        <span className={s.legendItem}><span className={`${s.pip} ${s.warn}`} /> 50–200 ms — Acceptable</span>
        <span className={s.legendItem}><span className={`${s.pip} ${s.bad}`} /> &gt; 200 ms — Slow</span>
        <span className={s.legendItem}>Auto-refreshes every 30 s</span>
      </div>
    </div>
  );
}

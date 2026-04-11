"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./RecentViewsWidget.module.css";

interface ViewRow {
  id: string;
  content_type: string;
  content_id: string;
  ip: string;
  country: string | null;
  city: string | null;
  viewed_at: string;
  content_title: string | null;
  content_slug: string | null;
}

interface ViewsData {
  recent: ViewRow[];
  total: number;
  uniqueIps: number;
  topCountries: { country: string; cnt: string }[];
}

function maskIp(ip: string): string {
  if (!ip || ip === "0.0.0.0") return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  return ip.slice(0, -4) + "****";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function typeIcon(type: string) {
  if (type === "article") return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
  if (type === "video") return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function RecentViewsWidget() {
  const [data, setData] = useState<ViewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/views/recent?limit=15")
      .then((r) => r.json())
      .then((d: ViewsData) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}><h2 className={styles.widgetTitle}>Recent Viewers</h2></div>
      <div className={styles.loadingRows}>
        {[1,2,3,4,5].map(i => <div key={i} className={styles.loadingRow} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h2 className={styles.widgetTitle}>Recent Viewers</h2>
        <button className={styles.retryBtn} onClick={load}>Retry</button>
      </div>
      <p className={styles.empty}>Failed to load viewer data.</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h2 className={styles.widgetTitle}>Recent Viewers</h2>
        <button className={styles.retryBtn} onClick={load} title="Refresh">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{data.total.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Views</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{data.uniqueIps.toLocaleString()}</span>
          <span className={styles.statLabel}>Unique IPs</span>
        </div>
        {data.topCountries.length > 0 && (
          <div className={styles.statBox}>
            <span className={styles.statNum}>{data.topCountries[0].country}</span>
            <span className={styles.statLabel}>Top Country</span>
          </div>
        )}
      </div>

      {data.topCountries.length > 0 && (
        <div className={styles.countries}>
          {data.topCountries.map((c) => (
            <span key={c.country} className={styles.countryTag}>
              {c.country} <strong>{c.cnt}</strong>
            </span>
          ))}
        </div>
      )}

      {data.recent.length === 0 ? (
        <p className={styles.empty}>No views recorded yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Content</th>
                <th>IP</th>
                <th>Country</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((row) => (
                <tr key={row.id}>
                  <td className={styles.contentCell}>
                    <div className={styles.contentInner}>
                      <span className={styles.typeIcon}>{typeIcon(row.content_type)}</span>
                      <span className={styles.contentTitle} title={row.content_title ?? row.content_id}>
                        {row.content_title ?? row.content_id}
                      </span>
                    </div>
                  </td>
                  <td className={styles.ipCell}>{maskIp(row.ip ?? "")}</td>
                  <td className={styles.countryCell}>
                    {row.country ? (
                      <span>{row.country}{row.city ? `, ${row.city}` : ""}</span>
                    ) : "—"}
                  </td>
                  <td className={styles.timeCell}>{timeAgo(row.viewed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

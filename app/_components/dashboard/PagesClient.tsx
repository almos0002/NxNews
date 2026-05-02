"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cms.module.css";

interface Page {
  id: string;
  title_en: string;
  title_ne?: string | null;
  slug: string;
  status: string;
  view_count?: number | null;
  updated_at: string;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
];

function statusClass(s: string, stylesObj: Record<string, string>) {
  if (s === "published") return stylesObj.badgePublished;
  if (s === "archived") return stylesObj.badgeArchived;
  return stylesObj.badgeDraft;
}

export default function PagesClient({ initialPages }: { initialPages: Page[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialPages.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.title_en?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q) || p.title_ne?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab.key] = tab.key === "all"
      ? initialPages.length
      : initialPages.filter((p) => p.status === tab.key).length;
    return acc;
  }, {});

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1.5px solid",
                borderColor: statusFilter === tab.key ? "var(--color-accent)" : "var(--color-border)",
                background: statusFilter === tab.key ? "var(--color-accent)" : "transparent",
                color: statusFilter === tab.key ? "#fff" : "var(--color-ink)",
                fontFamily: "var(--font-serif)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: 6, fontSize: "0.7rem", opacity: 0.75,
                background: statusFilter === tab.key ? "rgba(255,255,255,0.2)" : "var(--color-border)",
                borderRadius: 8, padding: "1px 6px",
              }}>
                {counts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <input
          className={styles.input}
          style={{ maxWidth: 280 }}
          placeholder="Search by title or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Views</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No pages found.
                </td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.title_en}</strong>
                  {p.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{p.title_ne}</span></>}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>/{p.slug}</td>
                <td>
                  <span className={`${styles.badge} ${statusClass(p.status, styles)}`}>{p.status}</span>
                </td>
                <td className={styles.viewsCell}>
                  {p.view_count != null && p.view_count > 0 ? (
                    <span className={styles.viewsValue}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {(p.view_count ?? 0) >= 1000 ? `${((p.view_count ?? 0) / 1000).toFixed(1)}k` : (p.view_count ?? 0).toLocaleString()}
                    </span>
                  ) : <span className={styles.none}>—</span>}
                </td>
                <td className={styles.dateCell}>
                  {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <Link href={`/en/dashboard/pages/${p.id}/edit`} className={styles.editBtn} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

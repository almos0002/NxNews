"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import ConfirmDialog from "../ui/ConfirmDialog";
import type { ArticleWithAuthor } from "@/lib/content/articles";
import styles from "./ArticleListClient.module.css";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
];

const STATUS_COLORS: Record<string, string> = {
  published: styles.badgePublished,
  draft: styles.badgeDraft,
  archived: styles.badgeArchived,
};

interface Props {
  initialArticles: ArticleWithAuthor[];
  counts: Record<string, number>;
  currentStatus: string;
  currentSearch: string;
}

export default function ArticleListClient({
  initialArticles,
  counts,
  currentStatus,
  currentSearch,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams(params);
    startTransition(() => {
      router.push(`?${sp.toString()}`);
    });
  }

  function handleStatusChange(s: string) {
    navigate({ status: s, ...(search ? { search } : {}) });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ status: currentStatus, ...(search ? { search } : {}) });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirm(null);
        toast("Article deleted.", "success");
        router.refresh();
      } else {
        toast("Failed to delete article.", "error");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  const q = search.trim().toLowerCase();
  const displayArticles = q
    ? initialArticles.filter(
        (a) =>
          a.title_en?.toLowerCase().includes(q) ||
          a.title_ne?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q) ||
          a.author_name?.toLowerCase().includes(q)
      )
    : initialArticles;

  return (
    <div className={styles.listWrap}>
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Article"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          loading={deletingId === deleteConfirm.id}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.statusTabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.statusTab} ${currentStatus === tab.key ? styles.statusTabActive : ""}`}
              onClick={() => handleStatusChange(tab.key)}
            >
              {tab.label}
              <span className={styles.statusCount}>{counts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by title, category, author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Table */}
      {displayArticles.length === 0 ? (
        <div className={styles.empty}>
          <p>No articles found.</p>
          <Link href="/en/dashboard/articles/new" className={styles.emptyLink}>
            Write your first article →
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayArticles.map((article) => (
                <tr key={article.id}>
                  <td className={styles.titleCell}>
                    <span className={styles.titleEn}>{article.title_en || "—"}</span>
                    {article.title_ne && (
                      <span className={styles.titleNe}>{article.title_ne}</span>
                    )}
                  </td>
                  <td>
                    {article.category ? (
                      <span className={styles.category}>{article.category}</span>
                    ) : (
                      <span className={styles.none}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_COLORS[article.status] ?? ""}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className={styles.authorCell}>
                    {article.author_name ?? "—"}
                  </td>
                  <td className={styles.viewsCell}>
                    {article.view_count != null && article.view_count > 0 ? (
                      <span className={styles.viewsValue}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {(article.view_count ?? 0) >= 1000 ? `${((article.view_count ?? 0) / 1000).toFixed(1)}k` : (article.view_count ?? 0).toLocaleString()}
                      </span>
                    ) : <span className={styles.none}>—</span>}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(article.created_at)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {article.status === "published" && (
                        <Link
                          href={`/en/article/${article.slug}`}
                          className={styles.actionView}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View live"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </Link>
                      )}
                      <Link
                        href={`/en/dashboard/articles/${article.id}/edit`}
                        className={styles.actionEdit}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </Link>
                      <button
                        className={styles.actionDelete}
                        onClick={() => setDeleteConfirm({ id: article.id, title: article.title_en || article.title_ne || "this article" })}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

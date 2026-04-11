"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import ConfirmDialog from "@/app/_components/ConfirmDialog";
import styles from "@/app/_components/cms.module.css";

interface FeaturedArticle {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  category: string;
  status: string;
  view_count: number;
  author_name: string | null;
  updated_at: string;
}

interface ArticleOption {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  category: string;
  is_featured: boolean;
  author_name: string | null;
}

interface Props {
  initialFeatured: FeaturedArticle[];
  allArticles: ArticleOption[];
}

export default function FeaturedClient({ initialFeatured, allArticles }: Props) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; title: string } | null>(null);

  const featuredIds = new Set(featured.map((a) => a.id));

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allArticles
      .filter((a) => !featuredIds.has(a.id) && (
        a.title_en.toLowerCase().includes(q) ||
        a.title_ne?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.author_name?.toLowerCase().includes(q)
      ))
      .slice(0, 8);
  }, [search, allArticles, featuredIds]);

  async function setFeaturedStatus(articleId: string, isFeatured: boolean, article?: ArticleOption) {
    setSaving(articleId);
    try {
      const res = await fetch("/api/articles/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, featured: isFeatured }),
      });
      if (!res.ok) { toast("Failed to update featured status.", "error"); return; }

      if (isFeatured && article) {
        const newItem: FeaturedArticle = {
          id: article.id, title_en: article.title_en, title_ne: article.title_ne,
          slug: article.slug, category: article.category, status: "published",
          view_count: 0, author_name: article.author_name, updated_at: new Date().toISOString(),
        };
        setFeatured((prev) => [newItem, ...prev]);
        setSearch("");
        toast(`"${article.title_en}" added to featured posts.`, "success");
      } else {
        setFeatured((prev) => prev.filter((a) => a.id !== articleId));
        setRemoveConfirm(null);
        toast("Article removed from featured.", "success");
      }
    } finally { setSaving(null); }
  }

  return (
    <div className={styles.page}>
      {removeConfirm && (
        <ConfirmDialog
          title="Remove from Featured"
          message={`Remove "${removeConfirm.title}" from featured posts? It will no longer appear in the featured section.`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          variant="warn"
          loading={saving === removeConfirm.id}
          onConfirm={() => setFeaturedStatus(removeConfirm.id, false)}
          onCancel={() => setRemoveConfirm(null)}
        />
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Featured Posts</h1>
          <p className={styles.pageSubtitle}>
            Control which articles appear in the featured spotlight on the homepage.
          </p>
        </div>
      </div>

      {/* Search to add */}
      <div className={styles.formCard}>
        <p className={styles.formTitle}>Add Article to Featured</p>
        <div style={{ position: "relative" }}>
          <input
            className={styles.input}
            placeholder="Search published articles by title, category, or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
              background: "var(--color-surface, #fff)", border: "1px solid var(--color-border)",
              borderRadius: "0 0 8px 8px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              maxHeight: 340, overflowY: "auto",
            }}>
              {searchResults.map((a) => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderBottom: "1px solid var(--color-border)", cursor: "pointer",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f7f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "0.87rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.title_en}
                    </p>
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.75rem", color: "var(--color-ink-muted)", margin: "2px 0 0" }}>
                      {[a.category, a.author_name].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    className={styles.submitBtn}
                    style={{ flexShrink: 0, fontSize: "0.78rem", padding: "6px 12px" }}
                    disabled={saving === a.id}
                    onClick={() => setFeaturedStatus(a.id, true, a)}
                  >
                    {saving === a.id ? "Adding…" : "+ Feature"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {search.trim() && searchResults.length === 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
              background: "var(--color-surface, #fff)", border: "1px solid var(--color-border)",
              borderRadius: "0 0 8px 8px", padding: "14px", fontFamily: "var(--font-serif)",
              fontSize: "0.85rem", color: "var(--color-ink-muted)",
            }}>
              No unfeatured published articles match your search.
            </div>
          )}
        </div>
      </div>

      {/* Featured list */}
      <div className={styles.tableCard}>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>
            Currently Featured
          </p>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>
            {featured.length} article{featured.length !== 1 ? "s" : ""}
          </span>
        </div>

        {featured.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>⭐</div>
            <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, margin: "0 0 6px" }}>No featured articles yet</p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)", margin: 0 }}>
              Use the search above to add articles to the featured spotlight.
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Author</th>
                <th>Views</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {featured.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div>
                      <p style={{ fontFamily: "var(--font-serif)", fontWeight: 600, margin: 0, fontSize: "0.87rem" }}>{a.title_en}</p>
                      {a.title_ne && <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.75rem", color: "var(--color-ink-muted)", margin: "2px 0 0" }}>{a.title_ne}</p>}
                    </div>
                  </td>
                  <td>
                    {a.category
                      ? <span className={styles.badge} style={{ background: "#f1f5f9", color: "#475569" }}>{a.category}</span>
                      : <span style={{ color: "var(--color-ink-muted)" }}>—</span>}
                  </td>
                  <td style={{ color: "var(--color-ink-muted)", fontSize: "0.82rem" }}>{a.author_name ?? "—"}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                    {a.view_count > 0
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {a.view_count >= 1000 ? `${(a.view_count / 1000).toFixed(1)}k` : a.view_count}
                        </span>
                      : <span style={{ color: "var(--color-ink-muted)" }}>—</span>}
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>
                    {new Date(a.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <Link
                        href={`/en/dashboard/articles/${a.id}/edit`}
                        className={styles.editBtn}
                        title="Edit article"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </Link>
                      <button
                        className={styles.deleteBtn}
                        title="Remove from featured"
                        disabled={saving === a.id}
                        onClick={() => setRemoveConfirm({ id: a.id, title: a.title_en })}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";

interface Article {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  excerpt_en: string;
  category: string;
  status: string;
  author_name: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface Props { initialArticles: Article[]; }

export default function ModerationClient({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [processing, setProcessing] = useState<string | null>(null);

  async function changeStatus(id: string, status: "published" | "draft") {
    setProcessing(id);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update status", "error"); return; }
      setArticles((p) => p.filter((a) => a.id !== id));
      toast(status === "published" ? "Article approved and published." : "Article rejected.", "success");
    } finally { setProcessing(null); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Review Queue</h1>
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
          {articles.length} article{articles.length !== 1 ? "s" : ""} pending review
        </span>
      </div>

      {articles.length === 0 ? (
        <div className={styles.formCard} style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✓</div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px" }}>All clear!</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--color-ink-muted)", margin: 0 }}>
            No articles are waiting for review at the moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {articles.map((a) => (
            <div key={a.id} style={{ background: "#fff", border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 6, alignSelf: "stretch", borderRadius: 3, background: "var(--color-accent)" }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 700, margin: 0, flex: 1 }}>
                    {a.title_en}
                  </h3>
                  {a.category && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#f1f5f9", color: "#475569", flexShrink: 0 }}>
                      {a.category}
                    </span>
                  )}
                </div>
                {a.title_ne && <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "var(--color-ink-muted)", margin: "0 0 6px" }}>{a.title_ne}</p>}
                {a.excerpt_en && <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>{a.excerpt_en.slice(0, 180)}{a.excerpt_en.length > 180 ? "…" : ""}</p>}

                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
                    By <strong>{a.author_name ?? "Unknown"}</strong>
                  </span>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
                    Submitted {new Date(a.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <Link
                    href={`/en/dashboard/articles/${a.id}/edit`}
                    style={{ fontFamily: "var(--font-serif)", fontSize: "0.78rem", color: "var(--color-accent)", textDecoration: "none" }}
                    target="_blank"
                  >
                    View / Edit ↗
                  </Link>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => changeStatus(a.id, "published")}
                  disabled={processing === a.id}
                  style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", fontWeight: 600, background: "#065f46", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", cursor: "pointer", transition: "background 0.15s ease" }}
                >
                  {processing === a.id ? "…" : "✓ Approve"}
                </button>
                <button
                  onClick={() => changeStatus(a.id, "draft")}
                  disabled={processing === a.id}
                  style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", fontWeight: 600, background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "6px 16px", cursor: "pointer", transition: "background 0.15s ease" }}
                >
                  {processing === a.id ? "…" : "✕ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

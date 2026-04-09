"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import type { Category, Tag } from "@/lib/taxonomy";

interface Props {
  initialCategories: Category[];
  initialTags: Tag[];
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").slice(0, 60);
}

const COLORS = ["#e63946","#f4a261","#2a9d8f","#457b9d","#6a4c93","#606c38","#9b2226","#023e8a"];

export default function TaxonomyClient({ initialCategories, initialTags }: Props) {
  const [tab, setTab] = useState<"categories" | "tags">("categories");
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);
  const [err, setErr] = useState("");

  const [newCat, setNewCat] = useState({ name_en: "", name_ne: "", color: COLORS[0] });
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState({ name_en: "", name_ne: "", color: "" });
  const [savingCat, setSavingCat] = useState(false);

  const [newTag, setNewTag] = useState({ name_en: "", name_ne: "" });
  const [editTagId, setEditTagId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState({ name_en: "", name_ne: "" });
  const [savingTag, setSavingTag] = useState(false);

  async function addCategory() {
    if (!newCat.name_en.trim()) { setErr("English name required"); return; }
    setSavingCat(true); setErr("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCat, slug: toSlug(newCat.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setCategories((p) => [...p, data.category].sort((a, b) => a.name_en.localeCompare(b.name_en)));
      setNewCat({ name_en: "", name_ne: "", color: COLORS[0] });
    } finally { setSavingCat(false); }
  }

  async function saveCategory() {
    if (!editCat.name_en.trim() || !editCatId) return;
    setSavingCat(true); setErr("");
    try {
      const res = await fetch(`/api/categories/${editCatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editCat, slug: toSlug(editCat.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setCategories((p) => p.map((c) => c.id === editCatId ? data.category : c));
      setEditCatId(null);
    } finally { setSavingCat(false); }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) setCategories((p) => p.filter((c) => c.id !== id));
  }

  async function addTag() {
    if (!newTag.name_en.trim()) { setErr("English name required"); return; }
    setSavingTag(true); setErr("");
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTag, slug: toSlug(newTag.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setTags((p) => [...p, data.tag].sort((a, b) => a.name_en.localeCompare(b.name_en)));
      setNewTag({ name_en: "", name_ne: "" });
    } finally { setSavingTag(false); }
  }

  async function saveTag() {
    if (!editTag.name_en.trim() || !editTagId) return;
    setSavingTag(true); setErr("");
    try {
      const res = await fetch(`/api/tags/${editTagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editTag, slug: toSlug(editTag.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setTags((p) => p.map((t) => t.id === editTagId ? data.tag : t));
      setEditTagId(null);
    } finally { setSavingTag(false); }
  }

  async function deleteTag(id: string) {
    if (!confirm("Delete this tag?")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) setTags((p) => p.filter((t) => t.id !== id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Categories & Tags</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "categories" ? styles.tabActive : ""}`}
          onClick={() => { setTab("categories"); setErr(""); }}
        >
          Categories ({categories.length})
        </button>
        <button
          className={`${styles.tab} ${tab === "tags" ? styles.tabActive : ""}`}
          onClick={() => { setTab("tags"); setErr(""); }}
        >
          Tags ({tags.length})
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}

      {tab === "categories" && (
        <div className={styles.twoCol}>
          {/* Add form */}
          <div className={styles.formCard}>
            <p className={styles.formTitle}>Add Category</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={styles.field}>
                <label className={styles.label}>Name (English) *</label>
                <input className={styles.input} placeholder="e.g. Politics" value={newCat.name_en}
                  onChange={(e) => setNewCat((p) => ({ ...p, name_en: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (Nepali)</label>
                <input className={styles.input} placeholder="e.g. राजनीति" value={newCat.name_ne}
                  onChange={(e) => setNewCat((p) => ({ ...p, name_ne: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Color</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setNewCat((p) => ({ ...p, color: c }))}
                      style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: newCat.color === c ? "3px solid #222" : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <button className={styles.submitBtn} onClick={addCategory} disabled={savingCat}>
                {savingCat ? "Adding…" : "Add Category"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr><th>Category</th><th>Slug</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyRow}>No categories yet.</td></tr>
                ) : categories.map((c) => (
                  <tr key={c.id}>
                    {editCatId === c.id ? (
                      <td colSpan={3}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
                          <input className={styles.input} value={editCat.name_en}
                            onChange={(e) => setEditCat((p) => ({ ...p, name_en: e.target.value }))} placeholder="English name" />
                          <input className={styles.input} value={editCat.name_ne}
                            onChange={(e) => setEditCat((p) => ({ ...p, name_ne: e.target.value }))} placeholder="Nepali name" />
                          <div style={{ display: "flex", gap: 6 }}>
                            {COLORS.map((col) => (
                              <button key={col} type="button" onClick={() => setEditCat((p) => ({ ...p, color: col }))}
                                style={{ width: 20, height: 20, borderRadius: "50%", background: col, border: editCat.color === col ? "3px solid #222" : "2px solid transparent", cursor: "pointer" }} />
                            ))}
                          </div>
                          <div className={styles.actionRow}>
                            <button className={styles.submitBtn} onClick={saveCategory} disabled={savingCat}>{savingCat ? "Saving…" : "Save"}</button>
                            <button className={styles.cancelBtn} onClick={() => setEditCatId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          <span className={styles.colorSwatch} style={{ background: c.color }} />
                          <strong>{c.name_en}</strong>
                          {c.name_ne && <span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}> · {c.name_ne}</span>}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{c.slug}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <button className={styles.editBtn} onClick={() => { setEditCatId(c.id); setEditCat({ name_en: c.name_en, name_ne: c.name_ne, color: c.color }); }}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => deleteCategory(c.id)}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "tags" && (
        <div className={styles.twoCol}>
          {/* Add form */}
          <div className={styles.formCard}>
            <p className={styles.formTitle}>Add Tag</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={styles.field}>
                <label className={styles.label}>Name (English) *</label>
                <input className={styles.input} placeholder="e.g. Climate" value={newTag.name_en}
                  onChange={(e) => setNewTag((p) => ({ ...p, name_en: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTag()} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (Nepali)</label>
                <input className={styles.input} placeholder="e.g. जलवायु" value={newTag.name_ne}
                  onChange={(e) => setNewTag((p) => ({ ...p, name_ne: e.target.value }))} />
              </div>
              <button className={styles.submitBtn} onClick={addTag} disabled={savingTag}>
                {savingTag ? "Adding…" : "Add Tag"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr><th>Tag</th><th>Slug</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyRow}>No tags yet.</td></tr>
                ) : tags.map((t) => (
                  <tr key={t.id}>
                    {editTagId === t.id ? (
                      <td colSpan={3}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
                          <input className={styles.input} value={editTag.name_en}
                            onChange={(e) => setEditTag((p) => ({ ...p, name_en: e.target.value }))} placeholder="English name" />
                          <input className={styles.input} value={editTag.name_ne}
                            onChange={(e) => setEditTag((p) => ({ ...p, name_ne: e.target.value }))} placeholder="Nepali name" />
                          <div className={styles.actionRow}>
                            <button className={styles.submitBtn} onClick={saveTag} disabled={savingTag}>{savingTag ? "Saving…" : "Save"}</button>
                            <button className={styles.cancelBtn} onClick={() => setEditTagId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          <strong>{t.name_en}</strong>
                          {t.name_ne && <span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}> · {t.name_ne}</span>}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{t.slug}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <button className={styles.editBtn} onClick={() => { setEditTagId(t.id); setEditTag({ name_en: t.name_en, name_ne: t.name_ne }); }}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => deleteTag(t.id)}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

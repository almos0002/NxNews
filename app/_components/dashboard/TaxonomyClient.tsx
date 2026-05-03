"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import ConfirmDialog from "../ui/ConfirmDialog";
import TranslateButton from "../ui/TranslateButton";
import TranslateAllButton, { type TranslateFieldDescriptor } from "../ui/TranslateAllButton";
import TranslateFilledHint from "../ui/TranslateFilledHint";
import styles from "./cms.module.css";
import type { Category, Tag } from "@/lib/content/taxonomy";

interface Props {
  initialCategories: Category[];
  initialTags: Tag[];
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").slice(0, 60);
}

export default function TaxonomyClient({ initialCategories, initialTags }: Props) {
  const [tab, setTab] = useState<"categories" | "tags">("categories");
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);

  const [newCat, setNewCat] = useState({ name_en: "", name_ne: "" });
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState({ name_en: "", name_ne: "" });
  const [savingCat, setSavingCat] = useState(false);

  const [newTag, setNewTag] = useState({ name_en: "", name_ne: "" });
  const [editTagId, setEditTagId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState({ name_en: "", name_ne: "" });
  const [savingTag, setSavingTag] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "tag"; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function addCategory() {
    if (!newCat.name_en.trim()) { toast("English name required", "error"); return; }
    setSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCat, slug: toSlug(newCat.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to add category", "error"); return; }
      setCategories((p) => [...p, data.category].sort((a, b) => a.name_en.localeCompare(b.name_en)));
      setNewCat({ name_en: "", name_ne: "" });
      toast("Category added.", "success");
    } finally { setSavingCat(false); }
  }

  async function saveCategory() {
    if (!editCat.name_en.trim() || !editCatId) return;
    setSavingCat(true);
    try {
      const res = await fetch(`/api/categories/${editCatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editCat, slug: toSlug(editCat.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update category", "error"); return; }
      setCategories((p) => p.map((c) => c.id === editCatId ? data.category : c));
      setEditCatId(null);
      toast("Category updated.", "success");
    } finally { setSavingCat(false); }
  }

  async function addTag() {
    if (!newTag.name_en.trim()) { toast("English name required", "error"); return; }
    setSavingTag(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTag, slug: toSlug(newTag.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to add tag", "error"); return; }
      setTags((p) => [...p, data.tag].sort((a, b) => a.name_en.localeCompare(b.name_en)));
      setNewTag({ name_en: "", name_ne: "" });
      toast("Tag added.", "success");
    } finally { setSavingTag(false); }
  }

  async function saveTag() {
    if (!editTag.name_en.trim() || !editTagId) return;
    setSavingTag(true);
    try {
      const res = await fetch(`/api/tags/${editTagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editTag, slug: toSlug(editTag.name_en) }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update tag", "error"); return; }
      setTags((p) => p.map((t) => t.id === editTagId ? data.tag : t));
      setEditTagId(null);
      toast("Tag updated.", "success");
    } finally { setSavingTag(false); }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const url = deleteConfirm.type === "category"
        ? `/api/categories/${deleteConfirm.id}`
        : `/api/tags/${deleteConfirm.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) { toast("Failed to delete. It may be in use.", "error"); return; }
      if (deleteConfirm.type === "category") {
        setCategories((p) => p.filter((c) => c.id !== deleteConfirm.id));
        toast("Category deleted.", "success");
      } else {
        setTags((p) => p.filter((t) => t.id !== deleteConfirm.id));
        toast("Tag deleted.", "success");
      }
      setDeleteConfirm(null);
    } finally { setDeleting(false); }
  }

  return (
    <div className={styles.page}>
      {deleteConfirm && (
        <ConfirmDialog
          title={`Delete ${deleteConfirm.type === "category" ? "Category" : "Tag"}`}
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Categories & Tags</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "categories" ? styles.tabActive : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories ({categories.length})
        </button>
        <button
          className={`${styles.tab} ${tab === "tags" ? styles.tabActive : ""}`}
          onClick={() => setTab("tags")}
        >
          Tags ({tags.length})
        </button>
      </div>

      {tab === "categories" && (
        <div className={styles.twoCol}>
          <div className={styles.formCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p className={styles.formTitle} style={{ margin: 0 }}>Add Category</p>
              <TranslateAllButton getFields={(): TranslateFieldDescriptor[] => [
                { id: "newcat-en", label: "Name (EN)", source: newCat.name_ne, target: newCat.name_en, sourceLang: "ne", targetLang: "en",
                  setter: (v) => setNewCat((p) => ({ ...p, name_en: v })) },
                { id: "newcat-ne", label: "Name (NE)", source: newCat.name_en, target: newCat.name_ne, sourceLang: "en", targetLang: "ne",
                  setter: (v) => setNewCat((p) => ({ ...p, name_ne: v })) },
              ]} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={styles.field}>
                <label className={styles.label}>Name (English) *</label>
                <input className={styles.input} placeholder="e.g. Politics" value={newCat.name_en}
                  onChange={(e) => setNewCat((p) => ({ ...p, name_en: e.target.value }))} />
                <TranslateButton
                  source={newCat.name_ne}
                  sourceLang="ne"
                  targetLang="en"
                  currentTarget={newCat.name_en}
                  onTranslated={(v) => setNewCat((p) => ({ ...p, name_en: v }))}
                  compact
                />
                <TranslateFilledHint id="newcat-en" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (Nepali)</label>
                <input className={styles.input} placeholder="e.g. राजनीति" value={newCat.name_ne}
                  onChange={(e) => setNewCat((p) => ({ ...p, name_ne: e.target.value }))} />
                <TranslateButton
                  source={newCat.name_en}
                  sourceLang="en"
                  targetLang="ne"
                  currentTarget={newCat.name_ne}
                  onTranslated={(v) => setNewCat((p) => ({ ...p, name_ne: v }))}
                  compact
                />
                <TranslateFilledHint id="newcat-ne" />
              </div>
              <button className={styles.submitBtn} onClick={addCategory} disabled={savingCat}>
                {savingCat ? "Adding…" : "Add Category"}
              </button>
            </div>
          </div>

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
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <input className={styles.input} value={editCat.name_en}
                              onChange={(e) => setEditCat((p) => ({ ...p, name_en: e.target.value }))} placeholder="English name" />
                            <TranslateButton source={editCat.name_ne} sourceLang="ne" targetLang="en"
                              currentTarget={editCat.name_en}
                              onTranslated={(v) => setEditCat((p) => ({ ...p, name_en: v }))} compact />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <input className={styles.input} value={editCat.name_ne}
                              onChange={(e) => setEditCat((p) => ({ ...p, name_ne: e.target.value }))} placeholder="Nepali name" />
                            <TranslateButton source={editCat.name_en} sourceLang="en" targetLang="ne"
                              currentTarget={editCat.name_ne}
                              onTranslated={(v) => setEditCat((p) => ({ ...p, name_ne: v }))} compact />
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
                          <strong>{c.name_en}</strong>
                          {c.name_ne && <span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}> · {c.name_ne}</span>}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{c.slug}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <button className={styles.editBtn} onClick={() => { setEditCatId(c.id); setEditCat({ name_en: c.name_en, name_ne: c.name_ne }); }}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => setDeleteConfirm({ type: "category", id: c.id, name: c.name_en })}>Delete</button>
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
          <div className={styles.formCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p className={styles.formTitle} style={{ margin: 0 }}>Add Tag</p>
              <TranslateAllButton getFields={(): TranslateFieldDescriptor[] => [
                { id: "newtag-en", label: "Name (EN)", source: newTag.name_ne, target: newTag.name_en, sourceLang: "ne", targetLang: "en",
                  setter: (v) => setNewTag((p) => ({ ...p, name_en: v })) },
                { id: "newtag-ne", label: "Name (NE)", source: newTag.name_en, target: newTag.name_ne, sourceLang: "en", targetLang: "ne",
                  setter: (v) => setNewTag((p) => ({ ...p, name_ne: v })) },
              ]} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={styles.field}>
                <label className={styles.label}>Name (English) *</label>
                <input className={styles.input} placeholder="e.g. Climate" value={newTag.name_en}
                  onChange={(e) => setNewTag((p) => ({ ...p, name_en: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTag()} />
                <TranslateButton source={newTag.name_ne} sourceLang="ne" targetLang="en"
                  currentTarget={newTag.name_en}
                  onTranslated={(v) => setNewTag((p) => ({ ...p, name_en: v }))} compact />
                <TranslateFilledHint id="newtag-en" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (Nepali)</label>
                <input className={styles.input} placeholder="e.g. जलवायु" value={newTag.name_ne}
                  onChange={(e) => setNewTag((p) => ({ ...p, name_ne: e.target.value }))} />
                <TranslateButton source={newTag.name_en} sourceLang="en" targetLang="ne"
                  currentTarget={newTag.name_ne}
                  onTranslated={(v) => setNewTag((p) => ({ ...p, name_ne: v }))} compact />
                <TranslateFilledHint id="newtag-ne" />
              </div>
              <button className={styles.submitBtn} onClick={addTag} disabled={savingTag}>
                {savingTag ? "Adding…" : "Add Tag"}
              </button>
            </div>
          </div>

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
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <input className={styles.input} value={editTag.name_en}
                              onChange={(e) => setEditTag((p) => ({ ...p, name_en: e.target.value }))} placeholder="English name" />
                            <TranslateButton source={editTag.name_ne} sourceLang="ne" targetLang="en"
                              currentTarget={editTag.name_en}
                              onTranslated={(v) => setEditTag((p) => ({ ...p, name_en: v }))} compact />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <input className={styles.input} value={editTag.name_ne}
                              onChange={(e) => setEditTag((p) => ({ ...p, name_ne: e.target.value }))} placeholder="Nepali name" />
                            <TranslateButton source={editTag.name_en} sourceLang="en" targetLang="ne"
                              currentTarget={editTag.name_ne}
                              onTranslated={(v) => setEditTag((p) => ({ ...p, name_ne: v }))} compact />
                          </div>
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
                            <button className={styles.deleteBtn} onClick={() => setDeleteConfirm({ type: "tag", id: t.id, name: t.name_en })}>Delete</button>
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

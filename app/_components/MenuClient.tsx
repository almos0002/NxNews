"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import type { MenuItem } from "@/lib/menu";

interface PageOpt { id: string; slug: string; title_en: string; }

interface Props {
  initialNavbar: MenuItem[];
  initialFooter: MenuItem[];
  pages: PageOpt[];
}

type MenuType = "navbar" | "footer";

const EMPTY_FORM = {
  label_en: "", label_ne: "", link_type: "external" as "page" | "external",
  page_id: "", url: "", open_new_tab: false,
};

export default function MenuClient({ initialNavbar, initialFooter, pages }: Props) {
  const [tab, setTab] = useState<MenuType>("navbar");
  const [navbar, setNavbar] = useState(initialNavbar);
  const [footer, setFooter] = useState(initialFooter);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const items = tab === "navbar" ? navbar : footer;
  const setItems = useCallback((fn: (p: MenuItem[]) => MenuItem[]) => {
    if (tab === "navbar") setNavbar(fn);
    else setFooter(fn);
  }, [tab]);

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function openAdd() { setForm({ ...EMPTY_FORM }); setEditId(null); setErr(""); setOk(""); }
  function openEdit(it: MenuItem) {
    setForm({ label_en: it.label_en, label_ne: it.label_ne, link_type: it.link_type, page_id: it.page_id ?? "", url: it.url, open_new_tab: it.open_new_tab });
    setEditId(it.id); setErr(""); setOk("");
  }
  function closeEdit() { setEditId(null); setErr(""); }

  async function submit() {
    if (!form.label_en.trim()) { setErr("English label is required"); return; }
    if (form.link_type === "external" && !form.url.trim()) { setErr("URL is required for external links"); return; }
    if (form.link_type === "page" && !form.page_id) { setErr("Please select a page"); return; }
    setSaving(true); setErr("");
    try {
      const payload = {
        label_en: form.label_en.trim(), label_ne: form.label_ne.trim(),
        link_type: form.link_type,
        page_id: form.link_type === "page" ? form.page_id : null,
        url: form.link_type === "external" ? form.url.trim() : "",
        open_new_tab: form.open_new_tab,
        ...(editId ? {} : { menu_type: tab, sort_order: items.length }),
      };
      const url = editId ? `/api/menu/${editId}` : "/api/menu";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      if (editId) {
        setItems((p) => p.map((it) => it.id === editId ? { ...it, ...data.item } : it));
        closeEdit();
      } else {
        setItems((p) => [...p, data.item]);
        setForm({ ...EMPTY_FORM });
        setOk("Item added.");
      }
    } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    if (!confirm("Remove this menu item?")) return;
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((it) => it.id !== id));
  }

  async function moveItem(index: number, dir: -1 | 1) {
    const next = dir === -1 ? index - 1 : index + 1;
    if (next < 0 || next >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    const withOrder = reordered.map((it, i) => ({ ...it, sort_order: i }));
    setItems(() => withOrder);
    await fetch("/api/menu/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: withOrder.map((it, i) => ({ id: it.id, sort_order: i })) }),
    });
  }

  function resolveUrl(it: MenuItem): string {
    if (it.link_type === "page") {
      return it.page_slug ? `/${it.page_slug}` : "#";
    }
    return it.url;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Menu Manager</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "navbar" ? styles.tabActive : ""}`} onClick={() => { setTab("navbar"); closeEdit(); setOk(""); }}>
          Navbar Menu ({navbar.length})
        </button>
        <button className={`${styles.tab} ${tab === "footer" ? styles.tabActive : ""}`} onClick={() => { setTab("footer"); closeEdit(); setOk(""); }}>
          Footer Menu ({footer.length})
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}
      {ok && <p className={styles.successMsg}>{ok}</p>}

      <div className={styles.twoCol}>
        {/* Items list */}
        <div>
          <p className={styles.formTitle} style={{ marginBottom: 10 }}>
            {tab === "navbar" ? "Navbar" : "Footer"} items — drag or use arrows to reorder
          </p>
          {items.length === 0 ? (
            <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", fontFamily: "var(--font-serif)", padding: 32 }}>
              No items yet. Add your first link →
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((it, idx) => (
                <div key={it.id} style={{ background: "#fff", border: "1.5px solid var(--color-border)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Sort controls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                      style={{ width: 22, height: 20, border: "1px solid var(--color-border)", background: idx === 0 ? "#f8f7f2" : "#fff", borderRadius: 4, cursor: idx === 0 ? "default" : "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.4 : 1 }}>▲</button>
                    <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1}
                      style={{ width: 22, height: 20, border: "1px solid var(--color-border)", background: idx === items.length - 1 ? "#f8f7f2" : "#fff", borderRadius: 4, cursor: idx === items.length - 1 ? "default" : "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === items.length - 1 ? 0.4 : 1 }}>▼</button>
                  </div>

                  {/* Item info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "0.9rem" }}>
                      {it.label_en}
                      {it.open_new_tab && <span style={{ marginLeft: 5, fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>↗</span>}
                    </div>
                    {it.label_ne && <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{it.label_ne}</div>}
                    <div style={{ fontFamily: "monospace", fontSize: "0.73rem", color: "var(--color-ink-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {resolveUrl(it)}
                    </div>
                  </div>

                  {/* Type badge */}
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: it.link_type === "page" ? "#ede9fe" : "#e0f2fe", color: it.link_type === "page" ? "#7c3aed" : "#0891b2" }}>
                    {it.link_type === "page" ? "page" : "link"}
                  </span>

                  {/* Actions */}
                  <div className={styles.actionRow} style={{ flexShrink: 0 }}>
                    <button className={styles.editBtn} onClick={() => editId === it.id ? closeEdit() : openEdit(it)}>
                      {editId === it.id ? "Cancel" : "Edit"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteItem(it.id)}>✕</button>
                  </div>

                  {/* Inline edit */}
                  {editId === it.id && (
                    <div style={{ position: "absolute", left: 0, right: 0, display: "none" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inline edit form */}
          {editId && (
            <div className={styles.formCard} style={{ marginTop: 16 }}>
              <p className={styles.formTitle}>Edit Item</p>
              <EditForm form={form} setF={setF} pages={pages} saving={saving} onSave={submit} onCancel={closeEdit} isEdit />
            </div>
          )}
        </div>

        {/* Add form */}
        {!editId && (
          <div className={styles.formCard} style={{ alignSelf: "start" }}>
            <p className={styles.formTitle}>Add Menu Item</p>
            <EditForm form={form} setF={setF} pages={pages} saving={saving} onSave={submit} onCancel={openAdd} isEdit={false} />
          </div>
        )}
      </div>
    </div>
  );
}

function EditForm({ form, setF, pages, saving, onSave, onCancel, isEdit }: {
  form: typeof EMPTY_FORM;
  setF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pages: PageOpt[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className={styles.field}>
        <label className={styles.label}>Label (English) *</label>
        <input className={styles.input} placeholder="e.g. About Us" value={form.label_en} onChange={(e) => setF("label_en", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Label (Nepali)</label>
        <input className={styles.input} placeholder="e.g. हाम्रो बारेमा" value={form.label_ne} onChange={(e) => setF("label_ne", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Link Type</label>
        <select className={styles.select} value={form.link_type} onChange={(e) => setF("link_type", e.target.value as "page" | "external")}>
          <option value="page">CMS Page</option>
          <option value="external">External URL</option>
        </select>
      </div>
      {form.link_type === "page" ? (
        <div className={styles.field}>
          <label className={styles.label}>Select Page *</label>
          {pages.length === 0 ? (
            <p className={styles.hint}>No published pages found. Create a page first.</p>
          ) : (
            <select className={styles.select} value={form.page_id} onChange={(e) => setF("page_id", e.target.value)}>
              <option value="">— choose a page —</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.title_en} (/{p.slug})</option>)}
            </select>
          )}
        </div>
      ) : (
        <div className={styles.field}>
          <label className={styles.label}>URL *</label>
          <input className={styles.input} type="url" placeholder="https://example.com/page" value={form.url} onChange={(e) => setF("url", e.target.value)} />
        </div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-serif)", fontSize: "0.82rem", cursor: "pointer" }}>
        <input type="checkbox" checked={form.open_new_tab} onChange={(e) => setF("open_new_tab", e.target.checked)} />
        Open in new tab
      </label>
      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update" : "Add Item"}
        </button>
        {isEdit && <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
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
  label_en: "", label_ne: "",
  link_type: "external" as "page" | "external",
  page_id: "", url: "", open_new_tab: false,
  section_label_en: "", section_label_ne: "",
};

export default function MenuClient({ initialNavbar, initialFooter, pages }: Props) {
  const [tab, setTab] = useState<MenuType>("navbar");
  const [navbar, setNavbar] = useState(initialNavbar);
  const [footer, setFooter] = useState(initialFooter);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  /* --- Add form state --- */
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [showAdd, setShowAdd] = useState(false);
  const [addToSection, setAddToSection] = useState(""); // "" = new section

  /* --- Edit state --- */
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  /* --- New section form (footer only) --- */
  const [newSectionLabelEn, setNewSectionLabelEn] = useState("");
  const [newSectionLabelNe, setNewSectionLabelNe] = useState("");

  const items = tab === "navbar" ? navbar : footer;
  const setItems = (fn: (p: MenuItem[]) => MenuItem[]) => {
    if (tab === "navbar") setNavbar(fn); else setFooter(fn);
  };

  /* Group footer items by section */
  const footerSections = groupBySectionKey(footer);

  /* --- Helpers --- */
  function groupBySectionKey(arr: MenuItem[]) {
    const map = new Map<string, MenuItem[]>();
    for (const it of arr) {
      const key = it.section_label_en || "__none__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }

  function resolveUrl(it: MenuItem): string {
    if (it.link_type === "page") return it.page_slug ? `/${it.page_slug}` : "#";
    return it.url;
  }

  function setAF<K extends keyof typeof addForm>(k: K, v: typeof addForm[K]) {
    setAddForm((p) => ({ ...p, [k]: v }));
  }
  function setEF<K extends keyof typeof editForm>(k: K, v: typeof editForm[K]) {
    setEditForm((p) => ({ ...p, [k]: v }));
  }

  function openAdd(sectionLabelEn = "", sectionLabelNe = "") {
    setAddForm({ ...EMPTY_FORM, section_label_en: sectionLabelEn, section_label_ne: sectionLabelNe });
    setAddToSection(sectionLabelEn);
    setShowAdd(true); setEditId(null); setErr(""); setOk("");
  }

  function openEdit(it: MenuItem) {
    setEditForm({
      label_en: it.label_en, label_ne: it.label_ne,
      link_type: it.link_type, page_id: it.page_id ?? "", url: it.url,
      open_new_tab: it.open_new_tab,
      section_label_en: it.section_label_en, section_label_ne: it.section_label_ne,
    });
    setEditId(it.id); setShowAdd(false); setErr(""); setOk("");
  }

  async function submitAdd() {
    if (!addForm.label_en.trim()) { setErr("English label is required"); return; }
    if (addForm.link_type === "external" && !addForm.url.trim()) { setErr("URL is required for external links"); return; }
    if (addForm.link_type === "page" && !addForm.page_id) { setErr("Please select a page"); return; }
    setSaving(true); setErr("");
    try {
      const payload = {
        menu_type: tab,
        label_en: addForm.label_en.trim(), label_ne: addForm.label_ne.trim(),
        link_type: addForm.link_type,
        page_id: addForm.link_type === "page" ? addForm.page_id : null,
        url: addForm.link_type === "external" ? addForm.url.trim() : "",
        open_new_tab: addForm.open_new_tab,
        sort_order: items.length,
        section_label_en: addForm.section_label_en.trim(),
        section_label_ne: addForm.section_label_ne.trim(),
      };
      const res = await fetch("/api/menu", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setItems((p) => [...p, data.item]);
      setAddForm({ ...EMPTY_FORM, section_label_en: addForm.section_label_en, section_label_ne: addForm.section_label_ne });
      setOk("Link added.");
      setNewSectionLabelEn(""); setNewSectionLabelNe("");
    } finally { setSaving(false); }
  }

  async function submitEdit() {
    if (!editForm.label_en.trim()) { setErr("English label is required"); return; }
    if (!editId) return;
    setSaving(true); setErr("");
    try {
      const payload = {
        label_en: editForm.label_en.trim(), label_ne: editForm.label_ne.trim(),
        link_type: editForm.link_type,
        page_id: editForm.link_type === "page" ? editForm.page_id : null,
        url: editForm.link_type === "external" ? editForm.url.trim() : "",
        open_new_tab: editForm.open_new_tab,
        section_label_en: editForm.section_label_en.trim(),
        section_label_ne: editForm.section_label_ne.trim(),
      };
      const res = await fetch(`/api/menu/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setItems((p) => p.map((it) => it.id === editId ? { ...it, ...data.item } : it));
      setEditId(null); setOk("Link updated.");
    } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    if (!confirm("Remove this menu link?")) return;
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) setItems((p) => p.filter((it) => it.id !== id));
  }

  async function moveItem(sectionItems: MenuItem[], index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= sectionItems.length) return;
    const reordered = [...sectionItems];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    const withOrder = reordered.map((it, i) => ({ ...it, sort_order: i }));
    setItems((p) => {
      const rest = p.filter((it) => !withOrder.find((w) => w.id === it.id));
      return [...rest, ...withOrder].sort((a, b) => {
        const sA = a.section_label_en; const sB = b.section_label_en;
        if (sA !== sB) return sA.localeCompare(sB);
        return a.sort_order - b.sort_order;
      });
    });
    await fetch("/api/menu/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: withOrder.map((it, i) => ({ id: it.id, sort_order: i })) }),
    });
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
        <button className={`${styles.tab} ${tab === "navbar" ? styles.tabActive : ""}`}
          onClick={() => { setTab("navbar"); setEditId(null); setShowAdd(false); setErr(""); setOk(""); }}>
          Navbar ({navbar.length})
        </button>
        <button className={`${styles.tab} ${tab === "footer" ? styles.tabActive : ""}`}
          onClick={() => { setTab("footer"); setEditId(null); setShowAdd(false); setErr(""); setOk(""); }}>
          Footer ({footer.length})
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}
      {ok && <p className={styles.successMsg}>{ok}</p>}

      {/* ─── NAVBAR TAB ─── */}
      {tab === "navbar" && (
        <div className={styles.twoCol}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p className={styles.formTitle} style={{ margin: 0 }}>Navbar Links — use ▲ ▼ to reorder</p>
            </div>
            <ItemList items={navbar} editId={editId} onEdit={openEdit} onDelete={deleteItem}
              onMove={(idx, dir) => moveItem(navbar, idx, dir)} resolveUrl={resolveUrl} />
          </div>
          <div>
            <button className={styles.newBtn} style={{ marginBottom: 12, width: "100%" }} onClick={() => openAdd()}>+ Add Navbar Link</button>
            {showAdd && !editId && (
              <ItemForm form={addForm} setF={setAF} pages={pages} saving={saving}
                onSave={submitAdd} onCancel={() => setShowAdd(false)} isEdit={false} showSection={false} />
            )}
            {editId && (
              <div className={styles.formCard}>
                <p className={styles.formTitle}>Edit Link</p>
                <ItemForm form={editForm} setF={setEF} pages={pages} saving={saving}
                  onSave={submitEdit} onCancel={() => setEditId(null)} isEdit showSection={false} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FOOTER TAB ─── */}
      {tab === "footer" && (
        <div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)", marginBottom: 20 }}>
            Footer links are organised into <strong>sections</strong> — each section becomes a named column in the footer. Add links to existing sections or create a new section.
          </p>

          {/* Existing sections */}
          {footerSections.size === 0 ? (
            <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32, fontFamily: "var(--font-serif)" }}>
              No footer links yet. Create your first section below.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {Array.from(footerSections.entries()).map(([sKey, sItems]) => {
                const sLabelEn = sItems[0]?.section_label_en || "(No section name)";
                const sLabelNe = sItems[0]?.section_label_ne || "";
                return (
                  <div key={sKey} style={{ background: "#fff", border: "1.5px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
                    {/* Section header */}
                    <div style={{ background: "#faf9f6", padding: "12px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.95rem" }}>{sLabelEn}</span>
                        {sLabelNe && <span style={{ marginLeft: 8, fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{sLabelNe}</span>}
                        <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--color-ink-muted)" }}>({sItems.length} link{sItems.length !== 1 ? "s" : ""})</span>
                      </div>
                      <button className={styles.newBtn} style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                        onClick={() => { openAdd(sLabelEn, sLabelNe); setShowAdd(true); }}>
                        + Add Link
                      </button>
                    </div>

                    {/* Add form for this section */}
                    {showAdd && addToSection === sLabelEn && !editId && (
                      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--color-border)", background: "#fffdf9" }}>
                        <ItemForm form={addForm} setF={setAF} pages={pages} saving={saving}
                          onSave={submitAdd} onCancel={() => setShowAdd(false)} isEdit={false} showSection={false} />
                      </div>
                    )}

                    {/* Links table */}
                    <table className={styles.table} style={{ marginBottom: 0 }}>
                      <tbody>
                        {sItems.map((it, idx) => (
                          <tr key={it.id}>
                            {editId === it.id ? (
                              <td colSpan={4}>
                                <div style={{ padding: "12px 6px" }}>
                                  <ItemForm form={editForm} setF={setEF} pages={pages} saving={saving}
                                    onSave={submitEdit} onCancel={() => setEditId(null)} isEdit showSection
                                    allSectionLabels={Array.from(footerSections.keys()).filter(k => k !== "__none__")} />
                                </div>
                              </td>
                            ) : (
                              <>
                                <td style={{ width: 48 }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <button onClick={() => moveItem(sItems, idx, -1)} disabled={idx === 0}
                                      style={{ width: 22, height: 18, border: "1px solid var(--color-border)", background: idx === 0 ? "#f8f7f2" : "#fff", borderRadius: 3, cursor: idx === 0 ? "default" : "pointer", fontSize: 9, opacity: idx === 0 ? 0.4 : 1 }}>▲</button>
                                    <button onClick={() => moveItem(sItems, idx, 1)} disabled={idx === sItems.length - 1}
                                      style={{ width: 22, height: 18, border: "1px solid var(--color-border)", background: idx === sItems.length - 1 ? "#f8f7f2" : "#fff", borderRadius: 3, cursor: idx === sItems.length - 1 ? "default" : "pointer", fontSize: 9, opacity: idx === sItems.length - 1 ? 0.4 : 1 }}>▼</button>
                                  </div>
                                </td>
                                <td>
                                  <strong style={{ fontFamily: "var(--font-serif)", fontSize: "0.88rem" }}>{it.label_en}</strong>
                                  {it.label_ne && <span style={{ marginLeft: 6, color: "var(--color-ink-muted)", fontSize: "0.78rem" }}>{it.label_ne}</span>}
                                  {it.open_new_tab && <span style={{ marginLeft: 4, fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>↗</span>}
                                </td>
                                <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-ink-muted)" }}>
                                  {resolveUrl(it)}
                                </td>
                                <td>
                                  <div className={styles.actionRow}>
                                    <button className={styles.editBtn} onClick={() => openEdit(it)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => deleteItem(it.id)}>✕</button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new section */}
          <div className={styles.formCard} style={{ marginTop: 24 }}>
            <p className={styles.formTitle}>Create New Section</p>
            <p className={styles.hint} style={{ marginBottom: 12 }}>A section becomes a new column in the footer.</p>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Section Heading (English) *</label>
                <input className={styles.input} placeholder="e.g. Company" value={newSectionLabelEn}
                  onChange={(e) => setNewSectionLabelEn(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Section Heading (Nepali)</label>
                <input className={styles.input} placeholder="e.g. कम्पनी" value={newSectionLabelNe}
                  onChange={(e) => setNewSectionLabelNe(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className={styles.submitBtn} disabled={!newSectionLabelEn.trim()}
                onClick={() => { openAdd(newSectionLabelEn.trim(), newSectionLabelNe.trim()); setShowAdd(true); }}>
                Create Section & Add First Link →
              </button>
            </div>

            {/* If creating new section, show full add form */}
            {showAdd && addToSection !== "" && !footerSections.has(addToSection) && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "var(--color-ink)", marginBottom: 12 }}>
                  Adding first link to section: <strong>"{addForm.section_label_en}"</strong>
                </p>
                <ItemForm form={addForm} setF={setAF} pages={pages} saving={saving}
                  onSave={submitAdd} onCancel={() => { setShowAdd(false); setNewSectionLabelEn(""); setNewSectionLabelNe(""); }}
                  isEdit={false} showSection={false} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared item form ─── */
function ItemForm({ form, setF, pages, saving, onSave, onCancel, isEdit, showSection, allSectionLabels = [] }: {
  form: typeof EMPTY_FORM;
  setF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pages: PageOpt[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
  showSection: boolean;
  allSectionLabels?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {showSection && (
        <div className={styles.field}>
          <label className={styles.label}>Move to Section</label>
          <select className={styles.select} value={form.section_label_en}
            onChange={(e) => setF("section_label_en", e.target.value)}>
            {allSectionLabels.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Label (English) *</label>
          <input className={styles.input} placeholder="e.g. About Us" value={form.label_en}
            onChange={(e) => setF("label_en", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Label (Nepali)</label>
          <input className={styles.input} placeholder="e.g. हाम्रो बारेमा" value={form.label_ne}
            onChange={(e) => setF("label_ne", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Link Type</label>
          <select className={styles.select} value={form.link_type}
            onChange={(e) => setF("link_type", e.target.value as "page" | "external")}>
            <option value="page">CMS Page</option>
            <option value="external">External URL</option>
          </select>
        </div>
        <div className={styles.field}>
          {form.link_type === "page" ? (
            <>
              <label className={styles.label}>Select Page *</label>
              {pages.length === 0 ? (
                <p className={styles.hint}>No published pages found.</p>
              ) : (
                <select className={styles.select} value={form.page_id}
                  onChange={(e) => setF("page_id", e.target.value)}>
                  <option value="">— choose a page —</option>
                  {pages.map((p) => <option key={p.id} value={p.id}>{p.title_en} (/{p.slug})</option>)}
                </select>
              )}
            </>
          ) : (
            <>
              <label className={styles.label}>URL *</label>
              <input className={styles.input} type="url" placeholder="https://…" value={form.url}
                onChange={(e) => setF("url", e.target.value)} />
            </>
          )}
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-serif)", fontSize: "0.82rem", cursor: "pointer" }}>
        <input type="checkbox" checked={form.open_new_tab} onChange={(e) => setF("open_new_tab", e.target.checked)} />
        Open in new tab
      </label>
      <div className={styles.formActions}>
        <button className={styles.submitBtn} onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update" : "Add Link"}
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ─── Navbar item list ─── */
function ItemList({ items, editId, onEdit, onDelete, onMove, resolveUrl }: {
  items: MenuItem[];
  editId: string | null;
  onEdit: (it: MenuItem) => void;
  onDelete: (id: string) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  resolveUrl: (it: MenuItem) => string;
}) {
  if (items.length === 0) {
    return (
      <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32, fontFamily: "var(--font-serif)" }}>
        No links yet. Add your first link →
      </div>
    );
  }
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id}>
              <td style={{ width: 44 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => onMove(idx, -1)} disabled={idx === 0}
                    style={{ width: 22, height: 18, border: "1px solid var(--color-border)", background: idx === 0 ? "#f8f7f2" : "#fff", borderRadius: 3, cursor: idx === 0 ? "default" : "pointer", fontSize: 9, opacity: idx === 0 ? 0.4 : 1 }}>▲</button>
                  <button onClick={() => onMove(idx, 1)} disabled={idx === items.length - 1}
                    style={{ width: 22, height: 18, border: "1px solid var(--color-border)", background: idx === items.length - 1 ? "#f8f7f2" : "#fff", borderRadius: 3, cursor: idx === items.length - 1 ? "default" : "pointer", fontSize: 9, opacity: idx === items.length - 1 ? 0.4 : 1 }}>▼</button>
                </div>
              </td>
              <td>
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: "0.88rem" }}>{it.label_en}</strong>
                {it.label_ne && <span style={{ marginLeft: 6, color: "var(--color-ink-muted)", fontSize: "0.78rem" }}>{it.label_ne}</span>}
                {it.open_new_tab && <span style={{ marginLeft: 4, fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>↗</span>}
              </td>
              <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-ink-muted)" }}>
                {resolveUrl(it)}
              </td>
              <td>
                <div className={styles.actionRow}>
                  <button className={styles.editBtn} onClick={() => editId === it.id ? onEdit(it) : onEdit(it)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(it.id)}>✕</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

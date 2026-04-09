"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import type { MenuItem } from "@/lib/menu";

interface PageOpt { id: string; slug: string; title_en: string; }

type MenuTab = "navbar" | "footer" | "bottom";

interface Props {
  initialNavbar: MenuItem[];
  initialFooter: MenuItem[];
  initialBottom: MenuItem[];
  pages: PageOpt[];
}

const EMPTY_FORM = {
  label_en: "", label_ne: "",
  link_type: "external" as "page" | "external",
  page_id: "", url: "", open_new_tab: false,
  section_label_en: "", section_label_ne: "",
};

export default function MenuClient({ initialNavbar, initialFooter, initialBottom, pages }: Props) {
  const [tab, setTab] = useState<MenuTab>("navbar");

  const [navbar, setNavbar] = useState(initialNavbar);
  const [footer, setFooter] = useState(initialFooter);
  const [bottom, setBottom] = useState(initialBottom);

  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [newSectionEn, setNewSectionEn] = useState("");
  const [newSectionNe, setNewSectionNe] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const items = tab === "navbar" ? navbar : tab === "bottom" ? bottom : footer;
  const setItems = useCallback((fn: (p: MenuItem[]) => MenuItem[]) => {
    if (tab === "navbar") setNavbar(fn);
    else if (tab === "bottom") setBottom(fn);
    else setFooter(fn);
  }, [tab]);

  function footerSections(arr: MenuItem[]): Map<string, MenuItem[]> {
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

  function switchTab(t: MenuTab) {
    setTab(t); setEditId(null); setErr(""); setOk("");
    setAddForm({ ...EMPTY_FORM }); setNewSectionEn(""); setNewSectionNe("");
  }

  function openEdit(it: MenuItem) {
    setEditForm({
      label_en: it.label_en, label_ne: it.label_ne,
      link_type: it.link_type, page_id: it.page_id ?? "", url: it.url,
      open_new_tab: it.open_new_tab,
      section_label_en: it.section_label_en, section_label_ne: it.section_label_ne,
    });
    setEditId(it.id); setErr(""); setOk("");
  }

  function cancelEdit() { setEditId(null); setErr(""); }

  async function submitAdd(sectionLabelEn = "", sectionLabelNe = "") {
    const form = { ...addForm, section_label_en: sectionLabelEn || addForm.section_label_en, section_label_ne: sectionLabelNe || addForm.section_label_ne };
    if (!form.label_en.trim()) { setErr("English label is required"); return; }
    if (form.link_type === "external" && !form.url.trim()) { setErr("URL is required for external links"); return; }
    if (form.link_type === "page" && !form.page_id) { setErr("Please select a page"); return; }
    setSaving(true); setErr("");
    try {
      const payload = {
        menu_type: tab,
        label_en: form.label_en.trim(), label_ne: form.label_ne.trim(),
        link_type: form.link_type,
        page_id: form.link_type === "page" ? form.page_id : null,
        url: form.link_type === "external" ? form.url.trim() : "",
        open_new_tab: form.open_new_tab,
        sort_order: items.length,
        section_label_en: form.section_label_en.trim(),
        section_label_ne: form.section_label_ne.trim(),
      };
      const res = await fetch("/api/menu", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      setItems((p) => [...p, data.item]);
      setAddForm({ ...EMPTY_FORM, section_label_en: form.section_label_en, section_label_ne: form.section_label_ne });
      setNewSectionEn(""); setNewSectionNe("");
      setOk("Link added.");
    } finally { setSaving(false); }
  }

  async function submitEdit() {
    if (!editForm.label_en.trim() || !editId) { setErr("English label is required"); return; }
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
      return [...rest, ...withOrder];
    });
    await fetch("/api/menu/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: withOrder.map((it, i) => ({ id: it.id, sort_order: i })) }),
    });
  }

  const sections = footerSections(footer);
  const sectionKeys = Array.from(sections.keys()).filter(k => k !== "__none__");

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Menu Manager</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "navbar" ? styles.tabActive : ""}`} onClick={() => switchTab("navbar")}>
          Navbar ({navbar.length})
        </button>
        <button className={`${styles.tab} ${tab === "footer" ? styles.tabActive : ""}`} onClick={() => switchTab("footer")}>
          Footer Columns ({footer.length})
        </button>
        <button className={`${styles.tab} ${tab === "bottom" ? styles.tabActive : ""}`} onClick={() => switchTab("bottom")}>
          Bottom Bar ({bottom.length})
        </button>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}
      {ok && <p className={styles.successMsg}>{ok}</p>}

      {/* ══════ NAVBAR + BOTTOM TABS — identical two-column layout ══════ */}
      {(tab === "navbar" || tab === "bottom") && (
        <div className={styles.twoCol}>
          {/* Left: items list */}
          <div>
            <p className={styles.formTitle} style={{ marginBottom: 12 }}>
              {tab === "navbar" ? "Navbar links" : "Bottom bar links"} — use ▲ ▼ to reorder
            </p>
            <FlatList
              items={items}
              editId={editId}
              editForm={editForm}
              setEF={setEF}
              pages={pages}
              saving={saving}
              onEdit={openEdit}
              onDelete={deleteItem}
              onMove={(idx, dir) => moveItem(items, idx, dir)}
              onSaveEdit={submitEdit}
              onCancelEdit={cancelEdit}
              resolveUrl={resolveUrl}
            />
          </div>

          {/* Right: always-visible add form */}
          <div className={styles.formCard} style={{ alignSelf: "start" }}>
            <p className={styles.formTitle}>
              {tab === "navbar" ? "Add Navbar Link" : "Add Bottom Bar Link"}
            </p>
            {tab === "bottom" && (
              <p className={styles.hint} style={{ marginBottom: 12 }}>
                These links appear in the thin bar at the very bottom of the footer (e.g. Privacy, Terms, Cookies).
              </p>
            )}
            <LinkForm form={addForm} setF={setAF} pages={pages} saving={saving} onSave={() => submitAdd()} showSectionPicker={false} />
          </div>
        </div>
      )}

      {/* ══════ FOOTER COLUMNS TAB ══════ */}
      {tab === "footer" && (
        <div className={styles.twoCol}>
          {/* Left: sections + items */}
          <div>
            <p className={styles.formTitle} style={{ marginBottom: 12 }}>Footer sections — each section is a column</p>
            {sections.size === 0 ? (
              <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32, fontFamily: "var(--font-serif)", fontSize: "0.9rem" }}>
                No footer sections yet. Create your first section →
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Array.from(sections.entries()).map(([sKey, sItems]) => {
                  const sLabelEn = sItems[0]?.section_label_en || "(Unnamed)";
                  const sLabelNe = sItems[0]?.section_label_ne || "";
                  return (
                    <div key={sKey} style={{ background: "#fff", border: "1.5px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ background: "#faf9f6", padding: "10px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700 }}>{sLabelEn}</span>
                        {sLabelNe && <span style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>· {sLabelNe}</span>}
                        <span style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", marginLeft: "auto" }}>{sItems.length} link{sItems.length !== 1 ? "s" : ""}</span>
                      </div>
                      <table className={styles.table}>
                        <tbody>
                          {sItems.map((it, idx) => (
                            <tr key={it.id}>
                              {editId === it.id ? (
                                <td colSpan={4} style={{ padding: "12px 14px" }}>
                                  <LinkForm form={editForm} setF={setEF} pages={pages} saving={saving}
                                    onSave={submitEdit} onCancel={cancelEdit}
                                    showSectionPicker sectionOptions={sectionKeys} isEdit />
                                </td>
                              ) : (
                                <>
                                  <td style={{ width: 44, paddingLeft: 12 }}>
                                    <SortButtons idx={idx} total={sItems.length} onMove={(d) => moveItem(sItems, idx, d)} />
                                  </td>
                                  <td>
                                    <strong style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem" }}>{it.label_en}</strong>
                                    {it.label_ne && <span style={{ marginLeft: 6, color: "var(--color-ink-muted)", fontSize: "0.78rem" }}>{it.label_ne}</span>}
                                    {it.open_new_tab && <span style={{ marginLeft: 4, fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>↗</span>}
                                  </td>
                                  <td style={{ fontFamily: "monospace", fontSize: "0.73rem", color: "var(--color-ink-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          </div>

          {/* Right: add link form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "start" }}>
            {/* Section picker or new section */}
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Add Footer Link</p>

              {sectionKeys.length > 0 && (
                <div className={styles.field} style={{ marginBottom: 12 }}>
                  <label className={styles.label}>Add to section</label>
                  <select className={styles.select} value={addForm.section_label_en}
                    onChange={(e) => {
                      const chosen = sections.get(e.target.value)?.[0];
                      setAF("section_label_en", e.target.value);
                      setAF("section_label_ne", chosen?.section_label_ne ?? "");
                    }}>
                    <option value="">— choose section —</option>
                    {sectionKeys.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <LinkForm form={addForm} setF={setAF} pages={pages} saving={saving}
                onSave={() => submitAdd(addForm.section_label_en, addForm.section_label_ne)}
                showSectionPicker={false} />
            </div>

            {/* Create new section */}
            <div className={styles.formCard}>
              <p className={styles.formTitle}>New Section</p>
              <p className={styles.hint} style={{ marginBottom: 10 }}>Creates a new column in the footer.</p>
              <div className={styles.field} style={{ marginBottom: 8 }}>
                <label className={styles.label}>Heading (English) *</label>
                <input className={styles.input} placeholder="e.g. Company" value={newSectionEn}
                  onChange={(e) => setNewSectionEn(e.target.value)} />
              </div>
              <div className={styles.field} style={{ marginBottom: 12 }}>
                <label className={styles.label}>Heading (Nepali)</label>
                <input className={styles.input} placeholder="e.g. कम्पनी" value={newSectionNe}
                  onChange={(e) => setNewSectionNe(e.target.value)} />
              </div>
              <button className={styles.submitBtn} disabled={!newSectionEn.trim()}
                onClick={() => {
                  setAF("section_label_en", newSectionEn.trim());
                  setAF("section_label_ne", newSectionNe.trim());
                  setOk(""); setErr("");
                }}>
                {addForm.section_label_en === newSectionEn.trim() && newSectionEn.trim()
                  ? `Adding to "${newSectionEn.trim()}" →`
                  : "Use This Section →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared sort buttons ─── */
function SortButtons({ idx, total, onMove }: { idx: number; total: number; onMove: (d: -1 | 1) => void }) {
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 22, height: 18, border: "1px solid var(--color-border)", borderRadius: 3, fontSize: 9,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1,
    background: disabled ? "#f8f7f2" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <button style={btnStyle(idx === 0)} onClick={() => onMove(-1)} disabled={idx === 0}>▲</button>
      <button style={btnStyle(idx === total - 1)} onClick={() => onMove(1)} disabled={idx === total - 1}>▼</button>
    </div>
  );
}

/* ─── Flat list for navbar and bottom bar ─── */
function FlatList({ items, editId, editForm, setEF, pages, saving, onEdit, onDelete, onMove, onSaveEdit, onCancelEdit, resolveUrl }: {
  items: MenuItem[]; editId: string | null;
  editForm: typeof EMPTY_FORM; setEF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pages: PageOpt[]; saving: boolean;
  onEdit: (it: MenuItem) => void; onDelete: (id: string) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onSaveEdit: () => void; onCancelEdit: () => void;
  resolveUrl: (it: MenuItem) => string;
}) {
  if (items.length === 0) return (
    <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32, fontFamily: "var(--font-serif)", fontSize: "0.9rem" }}>
      No links yet — add your first link →
    </div>
  );
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id}>
              {editId === it.id ? (
                <td colSpan={4} style={{ padding: "12px 14px" }}>
                  <LinkForm form={editForm} setF={setEF} pages={pages} saving={saving}
                    onSave={onSaveEdit} onCancel={onCancelEdit} showSectionPicker={false} isEdit />
                </td>
              ) : (
                <>
                  <td style={{ width: 44, paddingLeft: 12 }}>
                    <SortButtons idx={idx} total={items.length} onMove={(d) => onMove(idx, d)} />
                  </td>
                  <td>
                    <strong style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem" }}>{it.label_en}</strong>
                    {it.label_ne && <span style={{ marginLeft: 6, color: "var(--color-ink-muted)", fontSize: "0.78rem" }}>{it.label_ne}</span>}
                    {it.open_new_tab && <span style={{ marginLeft: 4, fontSize: "0.7rem", color: "var(--color-ink-muted)" }}>↗</span>}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.73rem", color: "var(--color-ink-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {resolveUrl(it)}
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={styles.editBtn} onClick={() => onEdit(it)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => onDelete(it.id)}>✕</button>
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
}

/* ─── Shared link form ─── */
function LinkForm({ form, setF, pages, saving, onSave, onCancel, showSectionPicker, sectionOptions = [], isEdit = false }: {
  form: typeof EMPTY_FORM;
  setF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pages: PageOpt[]; saving: boolean;
  onSave: () => void; onCancel?: () => void;
  showSectionPicker: boolean; sectionOptions?: string[]; isEdit?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {showSectionPicker && sectionOptions.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Move to Section</label>
          <select className={styles.select} value={form.section_label_en}
            onChange={(e) => setF("section_label_en", e.target.value)}>
            {sectionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <p className={styles.hint}>No published pages available.</p>
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
          {saving ? "Saving…" : isEdit ? "Update Link" : "Add Link"}
        </button>
        {onCancel && <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

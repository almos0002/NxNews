"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import Combobox from "../ui/Combobox";
import type { ComboboxOption } from "../ui/Combobox";
import TranslateButton from "../ui/TranslateButton";
import TranslateFilledHint from "../ui/TranslateFilledHint";
import TranslateAllButton, { type TranslateFieldDescriptor } from "../ui/TranslateAllButton";
import styles from "./cms.module.css";
import type { MenuItem } from "@/lib/cms/menu";

interface PageOpt { id: string; slug: string; title_en: string; }
interface CategoryOpt { slug: string; label: string; name_ne: string; }

type MenuTab = "navbar" | "footer" | "bottom";

interface Props {
  initialNavbar: MenuItem[];
  initialFooter: MenuItem[];
  initialBottom: MenuItem[];
  pages: PageOpt[];
  categories: CategoryOpt[];
}

const LINK_TYPE_OPTS: ComboboxOption[] = [
  { value: "category", label: "Category" },
  { value: "page",     label: "CMS Page" },
  { value: "external", label: "External URL" },
];

const EMPTY_FORM = {
  label_en: "", label_ne: "",
  link_type: "category" as "page" | "external" | "category",
  page_id: "", url: "", open_new_tab: false,
  section_label_en: "", section_label_ne: "",
};

export default function MenuClient({ initialNavbar, initialFooter, initialBottom, pages, categories }: Props) {
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

  const items = tab === "navbar" ? navbar : tab === "bottom" ? bottom : footer;
  const setItems = useCallback((fn: (p: MenuItem[]) => MenuItem[]) => {
    if (tab === "navbar") setNavbar(fn);
    else if (tab === "bottom") setBottom(fn);
    else setFooter(fn);
  }, [tab]);

  /* ── Combobox option builders ── */
  const pageOpts: ComboboxOption[] = pages.map((p) => ({ value: p.id, label: p.title_en, hint: `/${p.slug}` }));
  const catOpts: ComboboxOption[] = categories.map((c) => ({ value: c.slug, label: c.label, hint: `/${c.slug}` }));

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
    if (it.link_type === "category") return `/${it.url}`;
    return it.url;
  }

  function setAF<K extends keyof typeof addForm>(k: K, v: typeof addForm[K]) {
    setAddForm((p) => ({ ...p, [k]: v }));
  }
  function setEF<K extends keyof typeof editForm>(k: K, v: typeof editForm[K]) {
    setEditForm((p) => ({ ...p, [k]: v }));
  }

  function switchTab(t: MenuTab) {
    setTab(t); setEditId(null);
    setAddForm({ ...EMPTY_FORM }); setNewSectionEn(""); setNewSectionNe("");
  }

  function openEdit(it: MenuItem) {
    setEditForm({
      label_en: it.label_en, label_ne: it.label_ne,
      link_type: it.link_type, page_id: it.page_id ?? "", url: it.url,
      open_new_tab: it.open_new_tab,
      section_label_en: it.section_label_en, section_label_ne: it.section_label_ne,
    });
    setEditId(it.id);
  }

  function cancelEdit() { setEditId(null); }

  async function submitAdd(sectionLabelEn = "", sectionLabelNe = "") {
    const form = { ...addForm, section_label_en: sectionLabelEn || addForm.section_label_en, section_label_ne: sectionLabelNe || addForm.section_label_ne };
    if (!form.label_en.trim()) { toast("English label is required", "error"); return; }
    if (form.link_type === "external" && !form.url.trim()) { toast("URL is required for external links", "error"); return; }
    if (form.link_type === "page" && !form.page_id) { toast("Please select a page", "error"); return; }
    if (form.link_type === "category" && !form.url.trim()) { toast("Please select a category", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        menu_type: tab,
        label_en: form.label_en.trim(), label_ne: form.label_ne.trim(),
        link_type: form.link_type,
        page_id: form.link_type === "page" ? form.page_id : null,
        url: form.link_type === "page" ? "" : form.url.trim(),
        open_new_tab: form.open_new_tab,
        sort_order: items.length,
        section_label_en: form.section_label_en.trim(),
        section_label_ne: form.section_label_ne.trim(),
      };
      const res = await fetch("/api/menu", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to add link", "error"); return; }
      setItems((p) => [...p, data.item]);
      setAddForm({ ...EMPTY_FORM, section_label_en: form.section_label_en, section_label_ne: form.section_label_ne });
      setNewSectionEn(""); setNewSectionNe("");
      toast("Link added.", "success");
    } finally { setSaving(false); }
  }

  async function submitEdit() {
    if (!editForm.label_en.trim() || !editId) { toast("English label is required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        label_en: editForm.label_en.trim(), label_ne: editForm.label_ne.trim(),
        link_type: editForm.link_type,
        page_id: editForm.link_type === "page" ? editForm.page_id : null,
        url: editForm.link_type === "page" ? "" : editForm.url.trim(),
        open_new_tab: editForm.open_new_tab,
        section_label_en: editForm.section_label_en.trim(),
        section_label_ne: editForm.section_label_ne.trim(),
      };
      const res = await fetch(`/api/menu/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update link", "error"); return; }
      setItems((p) => p.map((it) => it.id === editId ? { ...it, ...data.item } : it));
      setEditId(null); toast("Link updated.", "success");
    } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((p) => p.filter((it) => it.id !== id));
      toast("Menu link removed.", "success");
    } else {
      toast("Failed to remove link.", "error");
    }
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

  /* ── Move entire footer section up/down ── */
  async function moveSection(sectionKey: string, dir: -1 | 1) {
    const sectionEntries = Array.from(footerSections(footer).entries());
    const idx = sectionEntries.findIndex(([k]) => k === sectionKey);
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= sectionEntries.length) return;

    // Swap the two sections
    const reordered = [...sectionEntries];
    [reordered[idx], reordered[nextIdx]] = [reordered[nextIdx], reordered[idx]];

    // Flatten and assign sequential sort_orders
    const allItemsOrdered: { id: string; sort_order: number }[] = [];
    const updatedFooter: MenuItem[] = [];
    let counter = 0;
    for (const [, sItems] of reordered) {
      for (const it of sItems) {
        allItemsOrdered.push({ id: it.id, sort_order: counter });
        updatedFooter.push({ ...it, sort_order: counter });
        counter++;
      }
    }
    setFooter(updatedFooter);
    await fetch("/api/menu/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: allItemsOrdered }),
    });
  }

  const sections = footerSections(footer);
  const sectionKeys = Array.from(sections.keys()).filter(k => k !== "__none__");
  const sectionEntries = Array.from(sections.entries());

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

      {/* ══════ NAVBAR + BOTTOM TABS ══════ */}
      {(tab === "navbar" || tab === "bottom") && (
        <div className={styles.twoCol}>
          <div>
            <p className={styles.formTitle} style={{ marginBottom: 12 }}>
              {tab === "navbar" ? "Navbar links" : "Bottom bar links"} — use ▲ ▼ to reorder
            </p>
            <FlatList
              items={items} editId={editId} editForm={editForm} setEF={setEF}
              categories={categories} pageOpts={pageOpts} catOpts={catOpts}
              saving={saving} onEdit={openEdit} onDelete={deleteItem}
              onMove={(idx, dir) => moveItem(items, idx, dir)}
              onSaveEdit={submitEdit} onCancelEdit={cancelEdit} resolveUrl={resolveUrl}
            />
          </div>

          <div className={styles.formCard} style={{ alignSelf: "start" }}>
            <p className={styles.formTitle}>
              {tab === "navbar" ? "Add Navbar Link" : "Add Bottom Bar Link"}
            </p>
            {tab === "bottom" && (
              <p className={styles.hint} style={{ marginBottom: 12 }}>
                These links appear in the thin bar at the very bottom of the footer (e.g. Privacy, Terms, Cookies).
              </p>
            )}
            <LinkForm form={addForm} setF={setAF} pageOpts={pageOpts} catOpts={catOpts} categories={categories}
              saving={saving} onSave={() => submitAdd()} showSectionPicker={false} />
          </div>
        </div>
      )}

      {/* ══════ FOOTER COLUMNS TAB ══════ */}
      {tab === "footer" && (
        <div className={styles.twoCol}>
          {/* Left: sections */}
          <div>
            <p className={styles.formTitle} style={{ marginBottom: 12 }}>Footer sections — each section is a column</p>
            {sections.size === 0 ? (
              <div className={styles.formCard} style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32, fontFamily: "var(--font-serif)", fontSize: "0.9rem" }}>
                No footer sections yet. Create your first section →
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {sectionEntries.map(([sKey, sItems], sIdx) => {
                  const sLabelEn = sItems[0]?.section_label_en || "(Unnamed)";
                  const sLabelNe = sItems[0]?.section_label_ne || "";
                  return (
                    <div key={sKey} style={{ background: "#fff", border: "1.5px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ background: "#faf9f6", padding: "10px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Section-level reorder */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4 }}>
                          <SortBtn disabled={sIdx === 0} onClick={() => moveSection(sKey, -1)}>▲</SortBtn>
                          <SortBtn disabled={sIdx === sectionEntries.length - 1} onClick={() => moveSection(sKey, 1)}>▼</SortBtn>
                        </div>
                        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700 }}>{sLabelEn}</span>
                        {sLabelNe && <span style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>· {sLabelNe}</span>}
                        <span style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", marginLeft: "auto" }}>
                          {sItems.length} link{sItems.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <table className={styles.table}>
                        <tbody>
                          {sItems.map((it, idx) => (
                            <tr key={it.id}>
                              {editId === it.id ? (
                                <td colSpan={4} style={{ padding: "12px 14px" }}>
                                  <LinkForm form={editForm} setF={setEF} pageOpts={pageOpts} catOpts={catOpts} categories={categories}
                                    saving={saving} onSave={submitEdit} onCancel={cancelEdit}
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

          {/* Right: add link + create section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignSelf: "start" }}>
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Add Footer Link</p>

              {sectionKeys.length > 0 && (
                <div className={styles.field} style={{ marginBottom: 12 }}>
                  <label className={styles.label}>Add to section</label>
                  <Combobox
                    options={sectionKeys.map((s) => ({ value: s, label: s }))}
                    value={addForm.section_label_en}
                    placeholder="— choose section —"
                    onChange={(v) => {
                      const chosen = sections.get(v)?.[0];
                      setAF("section_label_en", v);
                      setAF("section_label_ne", chosen?.section_label_ne ?? "");
                    }}
                  />
                </div>
              )}

              <LinkForm form={addForm} setF={setAF} pageOpts={pageOpts} catOpts={catOpts} categories={categories}
                saving={saving} onSave={() => submitAdd(addForm.section_label_en, addForm.section_label_ne)}
                showSectionPicker={false} />
            </div>

            <div className={styles.formCard}>
              <p className={styles.formTitle}>New Section</p>
              <p className={styles.hint} style={{ marginBottom: 10 }}>Creates a new column in the footer.</p>
              <div className={styles.field} style={{ marginBottom: 8 }}>
                <label className={styles.label}>Heading (English) *</label>
                <input className={styles.input} placeholder="e.g. Company" value={newSectionEn}
                  onChange={(e) => setNewSectionEn(e.target.value)} />
                <TranslateButton source={newSectionNe} sourceLang="ne" targetLang="en"
                  currentTarget={newSectionEn} onTranslated={setNewSectionEn} compact />
              </div>
              <div className={styles.field} style={{ marginBottom: 12 }}>
                <label className={styles.label}>Heading (Nepali)</label>
                <input className={styles.input} placeholder="e.g. कम्पनी" value={newSectionNe}
                  onChange={(e) => setNewSectionNe(e.target.value)} />
                <TranslateButton source={newSectionEn} sourceLang="en" targetLang="ne"
                  currentTarget={newSectionNe} onTranslated={setNewSectionNe} compact />
              </div>
              <button className={styles.submitBtn} disabled={!newSectionEn.trim()}
                onClick={() => {
                  setAF("section_label_en", newSectionEn.trim());
                  setAF("section_label_ne", newSectionNe.trim());
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

/* ─── Tiny sort button ─── */
function SortBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 22, height: 18, border: "1px solid var(--color-border)", borderRadius: 3, fontSize: 9,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1,
        background: disabled ? "#f8f7f2" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Shared sort buttons ─── */
function SortButtons({ idx, total, onMove }: { idx: number; total: number; onMove: (d: -1 | 1) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SortBtn disabled={idx === 0} onClick={() => onMove(-1)}>▲</SortBtn>
      <SortBtn disabled={idx === total - 1} onClick={() => onMove(1)}>▼</SortBtn>
    </div>
  );
}

/* ─── Flat list for navbar and bottom bar ─── */
function FlatList({ items, editId, editForm, setEF, pageOpts, catOpts, categories, saving, onEdit, onDelete, onMove, onSaveEdit, onCancelEdit, resolveUrl }: {
  items: MenuItem[]; editId: string | null;
  editForm: typeof EMPTY_FORM; setEF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pages?: { id: string; slug: string; title_en: string }[];
  categories: CategoryOpt[];
  pageOpts: ComboboxOption[]; catOpts: ComboboxOption[]; saving: boolean;
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
                  <LinkForm form={editForm} setF={setEF} pageOpts={pageOpts} catOpts={catOpts} categories={categories}
                    saving={saving} onSave={onSaveEdit} onCancel={onCancelEdit} showSectionPicker={false} isEdit />
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
function LinkForm({ form, setF, pageOpts, catOpts, categories, saving, onSave, onCancel, showSectionPicker, sectionOptions = [], isEdit = false }: {
  form: typeof EMPTY_FORM;
  setF: <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) => void;
  pageOpts: ComboboxOption[]; catOpts: ComboboxOption[]; categories: CategoryOpt[]; saving: boolean;
  onSave: () => void; onCancel?: () => void;
  showSectionPicker: boolean; sectionOptions?: string[]; isEdit?: boolean;
}) {
  const hasSection = isEdit && (form.section_label_en.trim() !== "" || form.section_label_ne.trim() !== "");
  const idPrefix = isEdit ? "menu-edit" : "menu-add";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <TranslateAllButton getFields={(): TranslateFieldDescriptor[] => {
          const base: TranslateFieldDescriptor[] = [
            { id: `${idPrefix}-label-en`, label: "Label (EN)", source: form.label_ne, target: form.label_en, sourceLang: "ne", targetLang: "en",
              setter: (v) => setF("label_en", v) },
            { id: `${idPrefix}-label-ne`, label: "Label (NE)", source: form.label_en, target: form.label_ne, sourceLang: "en", targetLang: "ne",
              setter: (v) => setF("label_ne", v) },
          ];
          if (hasSection) {
            base.push(
              { id: `${idPrefix}-section-en`, label: "Section heading (EN)", source: form.section_label_ne, target: form.section_label_en, sourceLang: "ne", targetLang: "en",
                setter: (v) => setF("section_label_en", v) },
              { id: `${idPrefix}-section-ne`, label: "Section heading (NE)", source: form.section_label_en, target: form.section_label_ne, sourceLang: "en", targetLang: "ne",
                setter: (v) => setF("section_label_ne", v) },
            );
          }
          return base;
        }} />
      </div>
      {showSectionPicker && sectionOptions.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Move to Section</label>
          <Combobox
            options={sectionOptions.map((s) => ({ value: s, label: s }))}
            value={form.section_label_en}
            placeholder="— choose section —"
            onChange={(v) => setF("section_label_en", v)}
          />
        </div>
      )}
      {hasSection && (
        <div className={styles.formGrid} style={{ background: "#faf9f6", padding: 10, borderRadius: 6, border: "1px solid var(--color-border)" }}>
          <div className={styles.field}>
            <label className={styles.label}>Section Heading (English)</label>
            <input className={styles.input} value={form.section_label_en}
              onChange={(e) => setF("section_label_en", e.target.value)}
              placeholder="e.g. Company" />
            <TranslateButton source={form.section_label_ne} sourceLang="ne" targetLang="en"
              currentTarget={form.section_label_en} onTranslated={(v) => setF("section_label_en", v)} compact />
            <TranslateFilledHint id={`${idPrefix}-section-en`} />
            <p className={styles.hint} style={{ fontSize: "0.7rem", marginTop: 4 }}>
              Updates the section heading stored on this link. To rename the column for all links, edit the same heading on each one (or use Translate all).
            </p>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Section Heading (Nepali)</label>
            <input className={styles.input} value={form.section_label_ne}
              onChange={(e) => setF("section_label_ne", e.target.value)}
              placeholder="e.g. कम्पनी" />
            <TranslateButton source={form.section_label_en} sourceLang="en" targetLang="ne"
              currentTarget={form.section_label_ne} onTranslated={(v) => setF("section_label_ne", v)} compact />
            <TranslateFilledHint id={`${idPrefix}-section-ne`} />
          </div>
        </div>
      )}
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Label (English) *</label>
          <input className={styles.input} placeholder="e.g. About Us" value={form.label_en}
            onChange={(e) => setF("label_en", e.target.value)} />
          <TranslateButton source={form.label_ne} sourceLang="ne" targetLang="en"
            currentTarget={form.label_en} onTranslated={(v) => setF("label_en", v)} compact />
          <TranslateFilledHint id={`${idPrefix}-label-en`} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Label (Nepali)</label>
          <input className={styles.input} placeholder="e.g. हाम्रो बारेमा" value={form.label_ne}
            onChange={(e) => setF("label_ne", e.target.value)} />
          <TranslateButton source={form.label_en} sourceLang="en" targetLang="ne"
            currentTarget={form.label_ne} onTranslated={(v) => setF("label_ne", v)} compact />
          <TranslateFilledHint id={`${idPrefix}-label-ne`} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Link Type</label>
          <Combobox
            options={LINK_TYPE_OPTS}
            value={form.link_type}
            placeholder="— select type —"
            searchable={false}
            onChange={(v) => setF("link_type", v as "page" | "external" | "category")}
          />
        </div>
        <div className={styles.field}>
          {form.link_type === "category" ? (
            <>
              <label className={styles.label}>Select Category *</label>
              <Combobox
                options={catOpts}
                value={form.url}
                placeholder="— choose category —"
                onChange={(v) => {
                  const cat = categories.find(c => c.slug === v);
                  setF("url", v);
                  if (cat) {
                    if (!form.label_en) setF("label_en", cat.label);
                    if (!form.label_ne && cat.name_ne) setF("label_ne", cat.name_ne);
                  }
                }}
              />
            </>
          ) : form.link_type === "page" ? (
            <>
              <label className={styles.label}>Select Page *</label>
              {pageOpts.length === 0 ? (
                <p className={styles.hint}>No published pages available.</p>
              ) : (
                <Combobox
                  options={pageOpts}
                  value={form.page_id}
                  placeholder="— choose a page —"
                  onChange={(v) => setF("page_id", v)}
                />
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

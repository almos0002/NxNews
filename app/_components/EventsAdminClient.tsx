"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "@/lib/toast";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./cms.module.css";
import type { EventPhoto, EventPhotoImage } from "@/lib/events";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

type FormImage = { url: string; caption_en: string; caption_ne: string };

interface FormState {
  title_en: string; title_ne: string;
  description_en: string; description_ne: string;
  location_en: string; location_ne: string;
  event_date: string; cover_image: string;
  images: FormImage[]; slug: string;
  status: "published" | "draft";
}

const EMPTY: FormState = {
  title_en: "", title_ne: "", description_en: "", description_ne: "",
  location_en: "", location_ne: "", event_date: "", cover_image: "",
  images: [], slug: "", status: "published",
};

function imgToForm(i: EventPhotoImage): FormImage {
  return { url: i.url, caption_en: i.caption_en ?? "", caption_ne: i.caption_ne ?? "" };
}

interface Props { initialEvents: EventPhoto[] }

export default function EventsAdminClient({ initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }
  function openEdit(e: EventPhoto) {
    setForm({
      title_en: e.title_en, title_ne: e.title_ne ?? "",
      description_en: e.description_en ?? "", description_ne: e.description_ne ?? "",
      location_en: e.location_en ?? "", location_ne: e.location_ne ?? "",
      event_date: e.event_date ? e.event_date.slice(0, 10) : "",
      cover_image: e.cover_image ?? "", slug: e.slug,
      images: e.images.map(imgToForm), status: e.status,
    });
    setEditId(e.id); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditId(null); }

  function setF<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleTitleChange(val: string) {
    setForm((p) => ({
      ...p, title_en: val,
      slug: editId ? p.slug : toSlug(val),
    }));
  }

  async function uploadFile(
    file: File,
    setLoading: (v: boolean) => void
  ): Promise<string | null> {
    setLoading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Upload failed", "error"); return null; }
      return data.url;
    } finally { setLoading(false); }
  }

  async function onCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadFile(file, setUploadingCover);
    if (url) setF("cover_image", url);
    e.target.value = "";
  }

  async function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploadingPhoto(true);
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) urls.push(data.url);
      else toast(`Failed to upload ${file.name}`, "error");
    }
    setUploadingPhoto(false);
    if (urls.length) {
      setForm((p) => ({
        ...p,
        images: [...p.images, ...urls.map((url) => ({ url, caption_en: "", caption_ne: "" }))],
      }));
    }
  }

  function removeImage(idx: number) {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  }

  function updateCaption(idx: number, field: "caption_en" | "caption_ne", val: string) {
    setForm((p) => ({
      ...p,
      images: p.images.map((img, i) => i === idx ? { ...img, [field]: val } : img),
    }));
  }

  async function submit() {
    if (!form.title_en.trim()) { toast("English title is required", "error"); return; }
    if (!form.slug.trim()) { toast("Slug is required", "error"); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        images: form.images.map(({ url, caption_en, caption_ne }) => ({
          url, caption_en: caption_en || undefined, caption_ne: caption_ne || undefined,
        })),
      };
      const url = editId ? `/api/events/${editId}` : "/api/events";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to save", "error"); return; }
      if (editId) {
        setEvents((p) => p.map((ev) => ev.id === editId ? data.event : ev));
        toast("Event updated.", "success");
      } else {
        setEvents((p) => [data.event, ...p]);
        toast("Event created.", "success");
      }
      closeForm();
    } finally { setSaving(false); }
  }

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((p) => p.filter((ev) => ev.id !== id));
      setDeleteConfirm(null); toast("Event deleted.", "success");
    } else { toast("Failed to delete.", "error"); }
  }

  return (
    <div className={styles.page}>
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Event"
          message="Delete this event and all its photos? This cannot be undone."
          confirmLabel="Delete" cancelLabel="Cancel" variant="danger"
          onConfirm={() => deleteEvent(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Event Photos</h1>
          <p className={styles.pageSubtitle}>Manage photo galleries for events and coverage.</p>
        </div>
        <div className={styles.pageHeaderRight} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/en/events" target="_blank" rel="noopener noreferrer" className={styles.submitBtn}
            style={{ background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-ink-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Public Page
          </a>
          <button className={styles.submitBtn} onClick={openAdd}>+ New Event</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formCardTitle}>{editId ? "Edit Event" : "New Event Gallery"}</h2>

          <div className={styles.formGrid}>
            {/* Titles */}
            <div className={styles.field}>
              <label className={styles.label}>Title (English) *</label>
              <input className={styles.input} value={form.title_en}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Dashain Celebration 2081" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Title (Nepali)</label>
              <input className={styles.input} value={form.title_ne}
                onChange={(e) => setF("title_ne", e.target.value)}
                placeholder="दशैं उत्सव २०८१" />
            </div>

            {/* Slug */}
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Slug *</label>
              <input className={styles.input} value={form.slug}
                onChange={(e) => setF("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="dashain-celebration-2081" />
              <p className={styles.hint}>URL: /events/{form.slug || "your-slug"}</p>
            </div>

            {/* Descriptions */}
            <div className={styles.field}>
              <label className={styles.label}>Description (English)</label>
              <textarea className={styles.textarea} rows={3} value={form.description_en}
                onChange={(e) => setF("description_en", e.target.value)}
                placeholder="Brief description of the event…" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description (Nepali)</label>
              <textarea className={styles.textarea} rows={3} value={form.description_ne}
                onChange={(e) => setF("description_ne", e.target.value)}
                placeholder="कार्यक्रमको संक्षिप्त विवरण…" />
            </div>

            {/* Location */}
            <div className={styles.field}>
              <label className={styles.label}>Location (English)</label>
              <input className={styles.input} value={form.location_en}
                onChange={(e) => setF("location_en", e.target.value)}
                placeholder="Tudikhel, Kathmandu" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Location (Nepali)</label>
              <input className={styles.input} value={form.location_ne}
                onChange={(e) => setF("location_ne", e.target.value)}
                placeholder="टुँडिखेल, काठमाडौं" />
            </div>

            {/* Date & Status */}
            <div className={styles.field}>
              <label className={styles.label}>Event Date</label>
              <input className={styles.input} type="date" value={form.event_date}
                onChange={(e) => setF("event_date", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select className={styles.select} value={form.status}
                onChange={(e) => setF("status", e.target.value as "published" | "draft")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Cover Image */}
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Cover Image</label>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input className={styles.input} value={form.cover_image}
                  onChange={(e) => setF("cover_image", e.target.value)}
                  placeholder="https://… or upload below" style={{ flex: 1 }} />
                <button type="button" className={styles.cancelBtn}
                  onClick={() => coverRef.current?.click()}
                  disabled={uploadingCover}
                  style={{ whiteSpace: "nowrap" }}>
                  {uploadingCover ? "Uploading…" : "Upload"}
                </button>
                <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={onCoverPick} />
              </div>
              {form.cover_image && (
                <div style={{ marginTop: 10, position: "relative", width: 200, height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                  <Image src={form.cover_image} alt="Cover preview" fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              )}
            </div>

            {/* Gallery Photos */}
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <label className={styles.label} style={{ marginBottom: 0 }}>
                  Gallery Photos ({form.images.length})
                </label>
                <button type="button" className={styles.cancelBtn}
                  onClick={() => photoRef.current?.click()}
                  disabled={uploadingPhoto}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {uploadingPhoto ? "Uploading…" : "Add Photos"}
                </button>
                <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={onPhotoPick} />
              </div>

              {form.images.length === 0 ? (
                <p style={{ color: "var(--color-ink-muted)", fontSize: "0.83rem" }}>
                  No photos yet. Click &quot;Add Photos&quot; to upload images.
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {form.images.map((img, idx) => (
                    <div key={idx} style={{ border: "1px solid var(--color-border)", borderRadius: 8, overflow: "hidden", background: "var(--color-surface)" }}>
                      <div style={{ position: "relative", width: "100%", paddingTop: "66%", background: "var(--color-surface-2, #f1f5f9)" }}>
                        <Image src={img.url} alt="" fill style={{ objectFit: "cover" }} unoptimized />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Remove photo"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                        <input
                          className={styles.input}
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                          placeholder="Caption (EN)"
                          value={img.caption_en}
                          onChange={(e) => updateCaption(idx, "caption_en", e.target.value)}
                        />
                        <input
                          className={styles.input}
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                          placeholder="क्याप्शन (NE)"
                          value={img.caption_ne}
                          onChange={(e) => updateCaption(idx, "caption_ne", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
            <button className={styles.submitBtn} onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editId ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Cover</th>
              <th>Title</th>
              <th>Location</th>
              <th>Date</th>
              <th>Photos</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyRow}>No events yet. Click &ldquo;+ New Event&rdquo; to create one.</td></tr>
            ) : events.map((ev) => (
              <tr key={ev.id}>
                <td>
                  {ev.cover_image ? (
                    <div style={{ position: "relative", width: 70, height: 46, borderRadius: 6, overflow: "hidden" }}>
                      <Image src={ev.cover_image} alt={ev.title_en} fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                  ) : (
                    <div className={styles.thumb} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                </td>
                <td>
                  <strong>{ev.title_en}</strong>
                  {ev.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{ev.title_ne}</span></>}
                  <br /><span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-ink-muted)" }}>/events/{ev.slug}</span>
                </td>
                <td style={{ fontSize: "0.83rem", color: "var(--color-ink-secondary)" }}>
                  {ev.location_en || <span className={styles.none}>—</span>}
                </td>
                <td className={styles.dateCell}>
                  {ev.event_date
                    ? new Date(ev.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : <span className={styles.none}>—</span>}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className={styles.badge} style={{ background: "var(--color-surface)" }}>
                    {ev.images.length} photo{ev.images.length !== 1 ? "s" : ""}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${ev.status === "published" ? styles.badgePublished : styles.badgeDraft}`}>
                    {ev.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.editBtn} onClick={() => openEdit(ev)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(ev.id)} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

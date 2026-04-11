"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./cms.module.css";

interface LiveStream {
  id: string;
  title_en: string;
  title_ne: string | null;
  description_en: string | null;
  description_ne: string | null;
  stream_url: string;
  platform: string;
  is_active: boolean;
  display_order: number;
}

const EMPTY: Omit<LiveStream, "id"> = {
  title_en: "", title_ne: "", description_en: "", description_ne: "",
  stream_url: "", platform: "youtube", is_active: true, display_order: 0,
};

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function LiveAdminClient({ initialStreams }: { initialStreams: LiveStream[] }) {
  const router = useRouter();
  const [streams, setStreams] = useState(initialStreams);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }
  function openEdit(s: LiveStream) {
    setForm({
      title_en: s.title_en, title_ne: s.title_ne ?? "", description_en: s.description_en ?? "",
      description_ne: s.description_ne ?? "", stream_url: s.stream_url,
      platform: s.platform, is_active: s.is_active, display_order: s.display_order,
    });
    setEditId(s.id); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditId(null); }
  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit() {
    if (!form.title_en.trim()) { toast("English title is required", "error"); return; }
    if (!form.stream_url.trim()) { toast("Stream URL is required", "error"); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/live/${editId}` : "/api/live";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to save", "error"); return; }
      if (editId) {
        setStreams((p) => p.map((s) => s.id === editId ? data.stream : s));
        toast("Stream updated.", "success");
      } else {
        setStreams((p) => [data.stream, ...p]);
        toast("Stream added.", "success");
      }
      closeForm();
    } finally { setSaving(false); }
  }

  async function deleteStream(id: string) {
    const res = await fetch(`/api/live/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStreams((p) => p.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      toast("Stream deleted.", "success");
    } else { toast("Failed to delete.", "error"); }
  }

  async function toggleActive(s: LiveStream) {
    const res = await fetch(`/api/live/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, is_active: !s.is_active }),
    });
    const data = await res.json();
    if (res.ok) {
      setStreams((p) => p.map((st) => st.id === s.id ? data.stream : st));
      toast(`Stream ${!s.is_active ? "activated" : "deactivated"}.`, "success");
    } else { toast("Failed to update.", "error"); }
  }

  const previewId = form.stream_url ? extractYoutubeId(form.stream_url) : null;

  return (
    <div className={styles.page}>
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Live Stream"
          message="Are you sure you want to delete this live stream link?"
          confirmLabel="Delete" cancelLabel="Cancel" variant="danger"
          onConfirm={() => deleteStream(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Live Streams</h1>
          <p className={styles.pageSubtitle}>Manage live YouTube channels and stream links shown on the public Live page.</p>
        </div>
        <div className={styles.pageHeaderRight} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/en/live" target="_blank" rel="noopener noreferrer" className={styles.submitBtn} style={{ background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-ink-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Live Page
          </a>
          <button className={styles.submitBtn} onClick={openAdd}>+ Add Stream</button>
        </div>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formCardTitle}>{editId ? "Edit Stream" : "Add New Stream"}</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Title (English) *</label>
              <input className={styles.input} value={form.title_en} onChange={(e) => setF("title_en", e.target.value)} placeholder="KumariHub News Live" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Title (Nepali)</label>
              <input className={styles.input} value={form.title_ne ?? ""} onChange={(e) => setF("title_ne", e.target.value)} placeholder="कुमारी हब समाचार" />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Stream URL *</label>
              <input
                className={styles.input}
                value={form.stream_url}
                onChange={(e) => setF("stream_url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/@channel/live"
              />
              <p className={styles.hint}>
                YouTube live video URL, YouTube channel live URL, or any live stream URL.
                For YouTube channels: use <code>https://youtube.com/@channelname/live</code>
              </p>
            </div>
            {previewId && (
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Preview</label>
                <div style={{ position: "relative", width: "100%", paddingTop: "35%", background: "#000", borderRadius: 8, overflow: "hidden" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${previewId}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    title="Preview"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Platform</label>
              <select className={styles.select} value={form.platform} onChange={(e) => setF("platform", e.target.value)}>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
                <option value="custom">Custom / Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Display Order</label>
              <input className={styles.input} type="number" min={0} value={form.display_order} onChange={(e) => setF("display_order", Number(e.target.value))} />
              <p className={styles.hint}>Lower numbers appear first (0 = first).</p>
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Description (English)</label>
              <textarea className={styles.textarea} rows={2} value={form.description_en ?? ""} onChange={(e) => setF("description_en", e.target.value)} placeholder="Brief description of this stream..." />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Description (Nepali)</label>
              <textarea className={styles.textarea} rows={2} value={form.description_ne ?? ""} onChange={(e) => setF("description_ne", e.target.value)} placeholder="यस प्रसारणको संक्षिप्त विवरण..." />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setF("is_active", e.target.checked)} />
                <span className={styles.label} style={{ margin: 0 }}>Active (visible on public live page)</span>
              </label>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
            <button className={styles.submitBtn} onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Stream"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>URL</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyRow}>No live streams added yet. Click &ldquo;+ Add Stream&rdquo; to get started.</td></tr>
            ) : streams.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.title_en}</strong>
                  {s.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{s.title_ne}</span></>}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeDraft}`} style={{ textTransform: "capitalize" }}>
                    {s.platform}
                  </span>
                </td>
                <td style={{ maxWidth: 200 }}>
                  <a href={s.stream_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-accent)", textDecoration: "none", wordBreak: "break-all" }}>
                    {s.stream_url.length > 50 ? s.stream_url.slice(0, 50) + "…" : s.stream_url}
                  </a>
                </td>
                <td style={{ textAlign: "center" }}>{s.display_order}</td>
                <td>
                  <button
                    onClick={() => toggleActive(s)}
                    className={`${styles.badge} ${s.is_active ? styles.badgePublished : styles.badgeArchived}`}
                    style={{ cursor: "pointer", border: "none", background: undefined }}
                    title="Toggle active"
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.editBtn} onClick={() => openEdit(s)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(s.id)} title="Delete">
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
      <div style={{ marginTop: 12, padding: "0 2px" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
          Click the status badge to quickly toggle a stream on/off without opening the edit form.
          The Live page at <a href="/en/live" style={{ color: "var(--color-accent)" }}>/live</a> shows all active streams.
        </p>
      </div>
    </div>
  );
}

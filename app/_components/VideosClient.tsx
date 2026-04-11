"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./cms.module.css";
import type { Video } from "@/lib/videos";
import Combobox from "./Combobox";

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

interface Props {
  initialVideos: Video[];
  authorId: string;
}

const EMPTY: Omit<Video, "id" | "created_at" | "updated_at" | "author_id" | "thumbnail"> = {
  title_en: "", title_ne: "", youtube_url: "", description_en: "", description_ne: "",
  status: "published", category: "", duration: "",
};

export default function VideosClient({ initialVideos, authorId }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }
  function openEdit(v: Video) {
    setForm({ title_en: v.title_en, title_ne: v.title_ne, youtube_url: v.youtube_url, description_en: v.description_en, description_ne: v.description_ne, status: v.status, category: v.category ?? "", duration: v.duration ?? "" });
    setEditId(v.id); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditId(null); }

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit() {
    if (!form.title_en.trim()) { toast("English title is required", "error"); return; }
    if (!form.youtube_url.trim()) { toast("YouTube URL is required", "error"); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/videos/${editId}` : "/api/videos";
      const method = editId ? "PUT" : "POST";
      const body = editId ? form : { ...form, author_id: authorId };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to save video", "error"); return; }
      if (editId) {
        setVideos((p) => p.map((v) => v.id === editId ? data.video : v));
        toast("Video updated.", "success");
      } else {
        setVideos((p) => [data.video, ...p]);
        toast("Video added.", "success");
      }
      closeForm();
    } finally { setSaving(false); }
  }

  async function deleteVideo(id: string) {
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVideos((p) => p.filter((v) => v.id !== id));
      setDeleteConfirm(null);
      toast("Video deleted.", "success");
    } else {
      toast("Failed to delete video.", "error");
    }
  }

  const previewId = extractYoutubeId(form.youtube_url);

  const vq = search.trim().toLowerCase();
  const filteredVideos = videos.filter((v) => {
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchSearch = !vq || v.title_en?.toLowerCase().includes(vq) || v.title_ne?.toLowerCase().includes(vq);
    return matchStatus && matchSearch;
  });

  return (
    <div className={styles.page}>
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Video"
          message="Are you sure you want to delete this video? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => deleteVideo(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Videos</h1>
        </div>
        <button className={styles.newBtn} onClick={openAdd}>+ Add Video</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>{editId ? "Edit Video" : "Add Video"}</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Title (English) *</label>
              <input className={styles.input} value={form.title_en} onChange={(e) => setF("title_en", e.target.value)} placeholder="Video title…" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Title (Nepali)</label>
              <input className={styles.input} value={form.title_ne} onChange={(e) => setF("title_ne", e.target.value)} placeholder="भिडियो शीर्षक…" />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>YouTube URL *</label>
              <input className={styles.input} value={form.youtube_url} onChange={(e) => setF("youtube_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…" />
              {previewId && (
                <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", maxWidth: 400, background: "#000" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${previewId}`}
                    title="Preview"
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description (English)</label>
              <textarea className={styles.textarea} value={form.description_en} onChange={(e) => setF("description_en", e.target.value)} placeholder="Brief description…" rows={3} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description (Nepali)</label>
              <textarea className={styles.textarea} value={form.description_ne} onChange={(e) => setF("description_ne", e.target.value)} placeholder="संक्षिप्त विवरण…" rows={3} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <Combobox
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft",     label: "Draft" },
                ]}
                value={form.status}
                searchable={false}
                onChange={(v) => setF("status", v as "published" | "draft")}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.submitBtn} onClick={submit} disabled={saving}>{saving ? "Saving…" : editId ? "Update Video" : "Add Video"}</button>
            <button className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1.5px solid",
                borderColor: statusFilter === s ? "var(--color-accent)" : "var(--color-border)",
                background: statusFilter === s ? "var(--color-accent)" : "transparent",
                color: statusFilter === s ? "#fff" : "var(--color-ink)",
                fontFamily: "var(--font-serif)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          className={styles.input}
          style={{ maxWidth: 280 }}
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Thumbnail</th>
              <th>Title</th>
              <th>YouTube</th>
              <th>Status</th>
              <th>Views</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyRow}>No videos found.</td></tr>
            ) : filteredVideos.map((v) => (
              <tr key={v.id}>
                <td>
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail} alt={v.title_en} className={styles.thumb} />
                  ) : (
                    <div className={styles.thumb} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  )}
                </td>
                <td>
                  <strong>{v.title_en}</strong>
                  {v.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{v.title_ne}</span></>}
                </td>
                <td>
                  <a href={v.youtube_url} target="_blank" rel="noopener noreferrer"
                     style={{ color: "var(--color-accent)", fontSize: "0.8rem", fontFamily: "monospace" }}>
                    {extractYoutubeId(v.youtube_url) ?? v.youtube_url.slice(0, 20)}
                  </a>
                </td>
                <td>
                  <span className={`${styles.badge} ${v.status === "published" ? styles.badgePublished : styles.badgeDraft}`}>
                    {v.status}
                  </span>
                </td>
                <td className={styles.viewsCell}>
                  {v.view_count != null && v.view_count > 0 ? (
                    <span className={styles.viewsValue}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {(v.view_count ?? 0) >= 1000 ? `${((v.view_count ?? 0) / 1000).toFixed(1)}k` : (v.view_count ?? 0).toLocaleString()}
                    </span>
                  ) : <span className={styles.none}>—</span>}
                </td>
                <td className={styles.dateCell}>
                  {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.editBtn} onClick={() => openEdit(v)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(v.id)} title="Delete">
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

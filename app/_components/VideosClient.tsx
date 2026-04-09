"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import type { Video } from "@/lib/videos";

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

interface Props {
  initialVideos: Video[];
  authorId: string;
}

const EMPTY: Omit<Video, "id" | "created_at" | "updated_at" | "author_id" | "thumbnail"> = {
  title_en: "", title_ne: "", youtube_url: "", description_en: "", description_ne: "", status: "published",
};

export default function VideosClient({ initialVideos, authorId }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function openAdd() { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); setErr(""); }
  function openEdit(v: Video) {
    setForm({ title_en: v.title_en, title_ne: v.title_ne, youtube_url: v.youtube_url, description_en: v.description_en, description_ne: v.description_ne, status: v.status });
    setEditId(v.id); setShowForm(true); setErr("");
  }
  function closeForm() { setShowForm(false); setEditId(null); setErr(""); }

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit() {
    if (!form.title_en.trim()) { setErr("English title is required"); return; }
    if (!form.youtube_url.trim()) { setErr("YouTube URL is required"); return; }
    setSaving(true); setErr("");
    try {
      const url = editId ? `/api/videos/${editId}` : "/api/videos";
      const method = editId ? "PUT" : "POST";
      const body = editId ? form : { ...form, author_id: authorId };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed"); return; }
      if (editId) {
        setVideos((p) => p.map((v) => v.id === editId ? data.video : v));
      } else {
        setVideos((p) => [data.video, ...p]);
      }
      closeForm();
    } finally { setSaving(false); }
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) setVideos((p) => p.filter((v) => v.id !== id));
  }

  const previewId = extractYoutubeId(form.youtube_url);

  return (
    <div className={styles.page}>
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
          {err && <p className={styles.errMsg}>{err}</p>}
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
              <select className={styles.select} value={form.status} onChange={(e) => setF("status", e.target.value as "published" | "draft")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.submitBtn} onClick={submit} disabled={saving}>{saving ? "Saving…" : editId ? "Update Video" : "Add Video"}</button>
            <button className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Thumbnail</th>
              <th>Title</th>
              <th>YouTube</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyRow}>No videos yet. Click "Add Video" to get started.</td></tr>
            ) : videos.map((v) => (
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
                <td style={{ color: "var(--color-ink-muted)", fontSize: "0.82rem" }}>
                  {new Date(v.created_at).toLocaleDateString("en-GB")}
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.editBtn} onClick={() => openEdit(v)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteVideo(v.id)}>Delete</button>
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

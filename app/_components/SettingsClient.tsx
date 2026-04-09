"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cms.module.css";
import sStyles from "./SettingsClient.module.css";

interface Props {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: Props) {
  const [s, setS] = useState({ ...initialSettings });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  function set(key: string, value: string) {
    setS((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true); setErr(""); setOk("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Save failed"); return; }
      setOk("Settings saved successfully.");
    } finally { setSaving(false); }
  }

  async function uploadFile(field: "logo_url" | "favicon_url", file: File) {
    const setUploading = field === "logo_url" ? setLogoUploading : setFaviconUploading;
    setUploading(true); setErr("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Upload failed"); return; }
      set(field, data.url);
    } finally { setUploading(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Site Settings</h1>
        </div>
        <div className={styles.pageHeaderRight}>
          <button className={styles.submitBtn} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save All Settings"}
          </button>
        </div>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}
      {ok && <p className={styles.successMsg}>{ok}</p>}

      <div className={sStyles.sections}>

        {/* ── Site Identity ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Site Identity</h2>
            <p className={sStyles.sectionDesc}>Name, description, logo and favicon displayed across the site.</p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Site Title (English)</label>
                <input className={styles.input} value={s.site_title_en ?? ""} onChange={(e) => set("site_title_en", e.target.value)} placeholder="KumariHub" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Site Title (Nepali)</label>
                <input className={styles.input} value={s.site_title_ne ?? ""} onChange={(e) => set("site_title_ne", e.target.value)} placeholder="कुमारीहब" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Site Tagline (English)</label>
                <input className={styles.input} value={s.site_tagline_en ?? ""} onChange={(e) => set("site_tagline_en", e.target.value)} placeholder="Independent, in-depth journalism for a complex world." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Site Tagline (Nepali)</label>
                <input className={styles.input} value={s.site_tagline_ne ?? ""} onChange={(e) => set("site_tagline_ne", e.target.value)} placeholder="जटिल संसारका लागि स्वतन्त्र, गहन पत्रकारिता।" />
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Site Description (English)</label>
                <textarea className={styles.textarea} rows={2} value={s.site_description_en ?? ""} onChange={(e) => set("site_description_en", e.target.value)} placeholder="Nepal's leading multilingual news portal…" />
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Site Description (Nepali)</label>
                <textarea className={styles.textarea} rows={2} value={s.site_description_ne ?? ""} onChange={(e) => set("site_description_ne", e.target.value)} placeholder="नेपालको अग्रणी बहुभाषी समाचार पोर्टल…" />
              </div>
            </div>

            {/* Logo */}
            <div className={sStyles.uploadRow}>
              <div className={sStyles.uploadPreview}>
                {s.logo_url ? (
                  <img src={s.logo_url} alt="Logo" className={sStyles.previewImg} />
                ) : (
                  <div className={sStyles.previewEmpty}>No logo</div>
                )}
              </div>
              <div className={sStyles.uploadInfo}>
                <p className={sStyles.uploadLabel}>Logo</p>
                <p className={sStyles.uploadHint}>Recommended: 260 × 80 px, PNG or WebP with transparent background.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <label className={styles.submitBtn} style={{ cursor: "pointer" }}>
                    {logoUploading ? "Uploading…" : "Upload Logo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={logoUploading}
                      onChange={(e) => { if (e.target.files?.[0]) uploadFile("logo_url", e.target.files[0]); }} />
                  </label>
                  {s.logo_url && (
                    <div className={styles.field} style={{ flex: 1, margin: 0 }}>
                      <input className={styles.input} value={s.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="/logo.png" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className={sStyles.uploadRow}>
              <div className={sStyles.uploadPreview} style={{ width: 48, height: 48 }}>
                {s.favicon_url ? (
                  <img src={s.favicon_url} alt="Favicon" style={{ width: 32, height: 32, objectFit: "contain" }} />
                ) : (
                  <div className={sStyles.previewEmpty} style={{ fontSize: "0.7rem" }}>None</div>
                )}
              </div>
              <div className={sStyles.uploadInfo}>
                <p className={sStyles.uploadLabel}>Favicon</p>
                <p className={sStyles.uploadHint}>Recommended: 32 × 32 px ICO or PNG file.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <label className={styles.submitBtn} style={{ cursor: "pointer" }}>
                    {faviconUploading ? "Uploading…" : "Upload Favicon"}
                    <input type="file" accept="image/*,.ico" style={{ display: "none" }} disabled={faviconUploading}
                      onChange={(e) => { if (e.target.files?.[0]) uploadFile("favicon_url", e.target.files[0]); }} />
                  </label>
                  {s.favicon_url && (
                    <div className={styles.field} style={{ flex: 1, margin: 0 }}>
                      <input className={styles.input} value={s.favicon_url} onChange={(e) => set("favicon_url", e.target.value)} placeholder="/favicon.ico" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact & Legal ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Contact & Legal</h2>
            <p className={sStyles.sectionDesc}>Contact email and copyright text shown in the footer.</p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Contact Email</label>
                <input className={styles.input} type="email" value={s.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} placeholder="hello@kumarihub.com" />
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Copyright Text</label>
                <input className={styles.input} value={s.copyright_text ?? ""} onChange={(e) => set("copyright_text", e.target.value)} placeholder="© 2026 KumariHub. All rights reserved." />
              </div>
            </div>
          </div>
        </div>

        {/* ── Social Media ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Social Media</h2>
            <p className={sStyles.sectionDesc}>Full URLs to your social media profiles.</p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              {[
                { key: "social_twitter", label: "Twitter / X", placeholder: "https://twitter.com/kumarihub" },
                { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/kumarihub" },
                { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/kumarihub" },
                { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/@kumarihub" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={styles.field}>
                  <label className={styles.label}>{label}</label>
                  <input className={styles.input} type="url" value={s[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Site Options ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Site Options</h2>
            <p className={sStyles.sectionDesc}>Feature toggles and global behaviour settings.</p>
          </div>
          <div className={sStyles.sectionBody}>
            <label className={sStyles.toggle}>
              <span className={sStyles.toggleTrack} data-on={s.breaking_news_enabled === "true"}>
                <span className={sStyles.toggleThumb} />
              </span>
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={s.breaking_news_enabled === "true"}
                onChange={(e) => set("breaking_news_enabled", e.target.checked ? "true" : "false")}
              />
              <span className={sStyles.toggleLabel}>
                Breaking news ticker
                <span className={sStyles.toggleDesc}>Show the live headline strip at the top of every page.</span>
              </span>
            </label>
          </div>
        </div>

      </div>

      <div className={sStyles.saveBar}>
        {err && <p className={styles.errMsg} style={{ margin: 0 }}>{err}</p>}
        {ok && <p className={styles.successMsg} style={{ margin: 0 }}>{ok}</p>}
        <button className={styles.submitBtn} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}

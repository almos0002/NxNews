"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";
import sStyles from "./SettingsClient.module.css";
import TranslateButton from "../ui/TranslateButton";
import TranslateAllButton, { type TranslateFieldDescriptor } from "../ui/TranslateAllButton";
import TranslateFilledHint from "../ui/TranslateFilledHint";

interface Props {
  initialSettings: Record<string, string>;
}

export default function SeoSettingsClient({ initialSettings }: Props) {
  const [s, setS] = useState({ ...initialSettings });
  const [saving, setSaving] = useState(false);
  const [ogUploading, setOgUploading] = useState(false);
  const [indexNowInfo, setIndexNowInfo] = useState<{
    configured: boolean; key: string | null; keyFileUrl: string | null;
  } | null>(null);
  const [indexNowSubmitting, setIndexNowSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/indexnow")
      .then((r) => r.json())
      .then((d) => setIndexNowInfo(d))
      .catch(() => {});
  }, []);

  function set(key: string, value: string) {
    setS((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Save failed", "error"); return; }
      toast("SEO settings saved successfully.", "success");
    } finally { setSaving(false); }
  }

  async function submitIndexNow() {
    setIndexNowSubmitting(true);
    try {
      const res = await fetch("/api/indexnow", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Submit failed", "error"); return; }
      toast(`IndexNow: submitted ${data.submitted} URL(s) to search engines.`, "success");
    } finally { setIndexNowSubmitting(false); }
  }

  async function uploadOgImage(file: File) {
    setOgUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Upload failed", "error"); return; }
      set("seo_og_image_url", data.url);
    } finally { setOgUploading(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard/settings" className={styles.breadcrumb}>← Site Settings</Link>
          <h1 className={styles.pageTitle}>SEO Settings</h1>
          <p className={styles.pageSubtitle}>
            Control how the site appears in search engines, social previews, and analytics.
          </p>
        </div>
        <div className={styles.pageHeaderRight} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TranslateAllButton getFields={(): TranslateFieldDescriptor[] => [
            { id: "seo-desc-en", label: "Default Meta Description (EN)", source: s.seo_default_description_ne ?? "", target: s.seo_default_description_en ?? "",
              sourceLang: "ne", targetLang: "en", setter: (v) => set("seo_default_description_en", v) },
            { id: "seo-desc-ne", label: "Default Meta Description (NE)", source: s.seo_default_description_en ?? "", target: s.seo_default_description_ne ?? "",
              sourceLang: "en", targetLang: "ne", setter: (v) => set("seo_default_description_ne", v) },
          ]} />
          <button className={styles.submitBtn} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save SEO Settings"}
          </button>
        </div>
      </div>

      <div className={sStyles.sections}>

        {/* ── Meta Titles & Descriptions ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Meta Titles &amp; Descriptions</h2>
            <p className={sStyles.sectionDesc}>
              Control what appears in browser tabs and search engine results. Use <code>%s</code> as a placeholder for the page title.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Title Template</label>
                <input
                  className={styles.input}
                  value={s.seo_meta_title_template ?? ""}
                  onChange={(e) => set("seo_meta_title_template", e.target.value)}
                  placeholder="%s | KumariHub"
                />
                <p className={styles.hint}>
                  Example: if the page title is &quot;Nepal Elections&quot; and the template is <code>%s | KumariHub</code>, the browser tab will show <em>Nepal Elections | KumariHub</em>.
                </p>
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Default Meta Description (English)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={s.seo_default_description_en ?? ""}
                  onChange={(e) => set("seo_default_description_en", e.target.value)}
                  placeholder="Nepal's leading multilingual news portal — independent, in-depth journalism for a complex world."
                />
                <TranslateButton source={s.seo_default_description_ne ?? ""} sourceLang="ne" targetLang="en"
                  currentTarget={s.seo_default_description_en ?? ""}
                  onTranslated={(v) => set("seo_default_description_en", v)} compact />
                <TranslateFilledHint id="seo-desc-en" />
                <p className={styles.hint}>Shown in search results when a page has no custom description. Aim for 120–160 characters.</p>
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Default Meta Description (Nepali)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={s.seo_default_description_ne ?? ""}
                  onChange={(e) => set("seo_default_description_ne", e.target.value)}
                  placeholder="नेपालको अग्रणी बहुभाषी समाचार पोर्टल — जटिल संसारका लागि स्वतन्त्र, गहन पत्रकारिता।"
                />
                <TranslateButton source={s.seo_default_description_en ?? ""} sourceLang="en" targetLang="ne"
                  currentTarget={s.seo_default_description_ne ?? ""}
                  onTranslated={(v) => set("seo_default_description_ne", v)} compact />
                <TranslateFilledHint id="seo-desc-ne" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Canonical URL ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Canonical &amp; Base URL</h2>
            <p className={sStyles.sectionDesc}>
              Used to build canonical link tags that prevent duplicate content penalties.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Canonical Base URL</label>
                <input
                  className={styles.input}
                  type="url"
                  value={s.seo_canonical_base_url ?? ""}
                  onChange={(e) => set("seo_canonical_base_url", e.target.value)}
                  placeholder="https://kumarihub.com"
                />
                <p className={styles.hint}>Enter your primary domain without a trailing slash. All canonical tags will be built relative to this.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Open Graph & Social Cards ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Open Graph &amp; Social Cards</h2>
            <p className={sStyles.sectionDesc}>
              Controls how links appear when shared on Facebook, Twitter/X, WhatsApp, and other platforms.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Twitter Card Type</label>
                <select
                  className={styles.select}
                  value={s.seo_twitter_card ?? "summary_large_image"}
                  onChange={(e) => set("seo_twitter_card", e.target.value)}
                >
                  <option value="summary_large_image">Summary with Large Image (recommended for news)</option>
                  <option value="summary">Summary (small thumbnail)</option>
                </select>
              </div>
            </div>

            <div className={sStyles.uploadRow}>
              <div className={sStyles.uploadPreview} style={{ width: 120, height: 70 }}>
                {s.seo_og_image_url ? (
                  <img src={s.seo_og_image_url} alt="OG Image" className={sStyles.previewImg} />
                ) : (
                  <div className={sStyles.previewEmpty}>No image</div>
                )}
              </div>
              <div className={sStyles.uploadInfo}>
                <p className={sStyles.uploadLabel}>Default OG / Share Image</p>
                <p className={sStyles.uploadHint}>
                  Used when an article has no featured image. Recommended: 1200 × 630 px JPG or PNG.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <label className={styles.submitBtn} style={{ cursor: "pointer" }}>
                    {ogUploading ? "Uploading…" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={ogUploading}
                      onChange={(e) => { if (e.target.files?.[0]) uploadOgImage(e.target.files[0]); }}
                    />
                  </label>
                  {s.seo_og_image_url && (
                    <div className={styles.field} style={{ flex: 1, margin: 0, minWidth: 200 }}>
                      <input
                        className={styles.input}
                        value={s.seo_og_image_url}
                        onChange={(e) => set("seo_og_image_url", e.target.value)}
                        placeholder="/og-image.jpg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Analytics & Verification ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Analytics &amp; Verification</h2>
            <p className={sStyles.sectionDesc}>
              Connect analytics and verify site ownership with major search engines.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Google Analytics 4 Measurement ID</label>
                <input
                  className={styles.input}
                  value={s.seo_ga4_id ?? ""}
                  onChange={(e) => set("seo_ga4_id", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className={styles.hint}>Starts with <code>G-</code>. Found in your GA4 property settings under &quot;Data Streams&quot;.</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Google Search Console Verification</label>
                <input
                  className={styles.input}
                  value={s.seo_gsc_verification ?? ""}
                  onChange={(e) => set("seo_gsc_verification", e.target.value)}
                  placeholder="abc123xyz..."
                />
                <p className={styles.hint}>
                  Content value from the <code>&lt;meta name=&quot;google-site-verification&quot;&gt;</code> tag in Google Search Console → Settings → Ownership verification.
                </p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Bing Webmaster Tools Verification</label>
                <input
                  className={styles.input}
                  value={s.seo_bing_verification ?? ""}
                  onChange={(e) => set("seo_bing_verification", e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
                <p className={styles.hint}>
                  Content value from the <code>&lt;meta name=&quot;msvalidate.01&quot;&gt;</code> tag. Found in Bing Webmaster Tools → Settings → Site Verification.
                </p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Yandex Webmaster Verification</label>
                <input
                  className={styles.input}
                  value={s.seo_yandex_verification ?? ""}
                  onChange={(e) => set("seo_yandex_verification", e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
                <p className={styles.hint}>
                  Content value from the <code>&lt;meta name=&quot;yandex-verification&quot;&gt;</code> tag in Yandex Webmaster → Site Verification.
                </p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Baidu Webmaster Verification</label>
                <input
                  className={styles.input}
                  value={s.seo_baidu_verification ?? ""}
                  onChange={(e) => set("seo_baidu_verification", e.target.value)}
                  placeholder="..."
                />
                <p className={styles.hint}>
                  Content value from <code>&lt;meta name=&quot;baidu-site-verification&quot;&gt;</code> for Baidu Search Resource Platform.
                </p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pinterest Domain Verification</label>
                <input
                  className={styles.input}
                  value={s.seo_pinterest_verification ?? ""}
                  onChange={(e) => set("seo_pinterest_verification", e.target.value)}
                  placeholder="..."
                />
                <p className={styles.hint}>
                  Content value from <code>&lt;meta name=&quot;p:domain_verify&quot;&gt;</code> in Pinterest analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sitemap ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Sitemap</h2>
            <p className={sStyles.sectionDesc}>
              Submit your sitemap URLs to search engines for faster indexing of your content.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>Sitemap URLs</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Main Sitemap", path: "/sitemap.xml" },
                    { label: "Article Sitemap", path: "/article-sitemap.xml" },
                    { label: "News Sitemap", path: "/news-sitemap.xml" },
                  ].map(({ label, path }) => {
                    const base = s.seo_canonical_base_url?.replace(/\/$/, "") ?? "";
                    const full = base ? `${base}${path}` : path;
                    return (
                      <div key={path} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 8 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", minWidth: 130 }}>{label}</span>
                        <code style={{ fontSize: "0.8rem", color: "var(--color-accent)", flex: 1 }}>{full}</code>
                        <a href={full} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", textDecoration: "none", padding: "3px 8px", border: "1px solid var(--color-border)", borderRadius: 4 }}>Open ↗</a>
                      </div>
                    );
                  })}
                </div>
                <p className={styles.hint}>
                  Submit these URLs in Google Search Console, Bing Webmaster Tools, and Yandex Webmaster for faster crawling.
                  Make sure your Canonical Base URL above is set correctly.
                </p>
              </div>
              <div className={`${styles.field} ${styles.formGridFull}`}>
                <label className={styles.label}>robots.txt Preview</label>
                <textarea
                  className={styles.textarea}
                  rows={6}
                  readOnly
                  value={[
                    "User-agent: *",
                    s.seo_robots_noindex === "true" ? "Disallow: /" : "Allow: /",
                    "",
                    `Sitemap: ${(s.seo_canonical_base_url ?? "").replace(/\/$/, "")}/sitemap.xml`,
                    `Sitemap: ${(s.seo_canonical_base_url ?? "").replace(/\/$/, "")}/news-sitemap.xml`,
                  ].join("\n")}
                  style={{ fontFamily: "monospace", fontSize: "0.8rem", cursor: "text", color: "var(--color-ink-muted)" }}
                />
                <p className={styles.hint}>
                  Preview of what your <code>robots.txt</code> would look like based on current settings. Your actual robots.txt file may differ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── IndexNow ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>IndexNow — Instant Indexing</h2>
            <p className={sStyles.sectionDesc}>
              IndexNow lets you ping Bing, Yandex, and other engines the moment an article is published —
              no waiting for a crawler. Articles are submitted automatically on publish.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            {indexNowInfo === null ? (
              <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>Loading…</p>
            ) : indexNowInfo.configured ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10 }}>
                  <span style={{ fontSize: "1.1rem" }}>✅</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#166534" }}>
                      IndexNow is active
                    </p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#15803d" }}>
                      Articles are submitted to search engines automatically when published.
                    </p>
                  </div>
                </div>

                {/* Key info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <p className={styles.label} style={{ marginBottom: 4 }}>Your IndexNow API Key</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ flex: 1, padding: "8px 12px", background: "var(--color-bg)",
                        border: "1px solid var(--color-border)", borderRadius: 7,
                        fontFamily: "monospace", fontSize: "0.85rem", color: "var(--color-accent)",
                        wordBreak: "break-all" }}>
                        {indexNowInfo.key}
                      </code>
                      <button
                        className={styles.actionBtn}
                        onClick={() => { navigator.clipboard.writeText(indexNowInfo.key ?? ""); toast("Key copied!", "success"); }}
                        style={{ whiteSpace: "nowrap", padding: "7px 14px", fontSize: "0.8rem" }}
                      >
                        Copy
                      </button>
                    </div>
                    <p className={styles.hint} style={{ marginTop: 6 }}>
                      This key is stored as the <code>INDEXNOW_KEY</code> environment variable.
                      Never share it publicly.
                    </p>
                  </div>

                  <div>
                    <p className={styles.label} style={{ marginBottom: 4 }}>Verification File URL</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ flex: 1, padding: "8px 12px", background: "var(--color-bg)",
                        border: "1px solid var(--color-border)", borderRadius: 7,
                        fontFamily: "monospace", fontSize: "0.82rem", color: "var(--color-ink-muted)",
                        wordBreak: "break-all" }}>
                        {indexNowInfo.keyFileUrl}
                      </code>
                      <a
                        href={indexNowInfo.keyFileUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ whiteSpace: "nowrap", fontSize: "0.8rem", padding: "7px 14px",
                          border: "1px solid var(--color-border)", borderRadius: 6,
                          background: "#fff", color: "var(--color-ink)", textDecoration: "none" }}
                      >
                        Open ↗
                      </a>
                    </div>
                    <p className={styles.hint} style={{ marginTop: 6 }}>
                      This file is hosted automatically. When you open it, it should display just the key. Search engines fetch it to verify site ownership.
                    </p>
                  </div>
                </div>

                {/* How it works */}
                <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: "0.82rem", color: "var(--color-ink)" }}>
                    How it works
                  </p>
                  <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5,
                    fontSize: "0.81rem", color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
                    <li><strong>Automatic</strong> — every time you publish or update an article, both the English and Nepali URLs are pinged instantly.</li>
                    <li><strong>Engines</strong> — Bing, Yandex, Seznam, and any other IndexNow-compatible engine receive the ping.</li>
                    <li><strong>Bing Webmaster</strong> — for the best Bing results, also add your key in <a href="https://www.bing.com/webmasters/indexnow" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)" }}>Bing Webmaster Tools → IndexNow</a>.</li>
                    <li><strong>Manual push</strong> — use the button below to submit the homepage and sitemaps right now.</li>
                  </ol>
                </div>

                {/* Manual submit */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button
                    className={styles.submitBtn}
                    onClick={submitIndexNow}
                    disabled={indexNowSubmitting}
                  >
                    {indexNowSubmitting ? "Submitting…" : "🚀 Submit Homepage to IndexNow Now"}
                  </button>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
                    Submits the homepage + sitemaps to Bing, Yandex, and others.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                background: "#fef9ec", border: "1.5px solid #fde68a", borderRadius: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.85rem", color: "#92400e" }}>
                    INDEXNOW_KEY is not set
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#b45309" }}>
                    Add <code>INDEXNOW_KEY</code> to your environment variables to activate IndexNow.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Indexing & Structured Data ── */}
        <div className={sStyles.section}>
          <div className={sStyles.sectionHead}>
            <h2 className={sStyles.sectionTitle}>Indexing &amp; Structured Data</h2>
            <p className={sStyles.sectionDesc}>
              Control search engine crawling and enable JSON-LD rich results.
            </p>
          </div>
          <div className={sStyles.sectionBody}>
            <label className={sStyles.toggle}>
              <span className={sStyles.toggleTrack} data-on={s.seo_robots_noindex === "true"}>
                <span className={sStyles.toggleThumb} />
              </span>
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={s.seo_robots_noindex === "true"}
                onChange={(e) => set("seo_robots_noindex", e.target.checked ? "true" : "false")}
              />
              <span className={sStyles.toggleLabel}>
                Block search engine indexing (noindex)
                <span className={sStyles.toggleDesc}>
                  Adds <code>noindex, nofollow</code> to all pages. Use only on staging or private sites. Leave off in production.
                </span>
              </span>
            </label>

            <label className={sStyles.toggle}>
              <span className={sStyles.toggleTrack} data-on={s.seo_structured_data_enabled !== "false"}>
                <span className={sStyles.toggleThumb} />
              </span>
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={s.seo_structured_data_enabled !== "false"}
                onChange={(e) => set("seo_structured_data_enabled", e.target.checked ? "true" : "false")}
              />
              <span className={sStyles.toggleLabel}>
                Enable JSON-LD structured data
                <span className={sStyles.toggleDesc}>
                  Outputs <code>NewsArticle</code> and <code>Organization</code> schema markup to help Google show rich results (headlines, author, date).
                </span>
              </span>
            </label>
          </div>
        </div>

      </div>

      <div className={sStyles.saveBar}>
        <button className={styles.submitBtn} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save SEO Settings"}
        </button>
      </div>
    </div>
  );
}

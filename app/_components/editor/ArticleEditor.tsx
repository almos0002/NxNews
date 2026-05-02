"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "@/lib/util/toast";
import styles from "./ArticleEditor.module.css";
import Combobox from "../ui/Combobox";
import type { ComboboxOption } from "../ui/Combobox";

const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className={styles.editorPlaceholder}>Loading editor…</div>
  ),
});

const DEFAULT_CATEGORIES = [
  "World", "Politics", "Business", "Technology", "Science",
  "Culture", "Opinion", "Sports", "Entertainment",
];

type Status = "draft" | "review" | "published" | "archived";
type Lang = "en" | "ne";
type ImgMode = "url" | "upload";

export interface ArticleFormValues {
  id?: string;
  title_en: string;
  title_ne: string;
  slug: string;
  excerpt_en: string;
  excerpt_ne: string;
  content_en: string;
  content_ne: string;
  category: string;
  tags: string[];
  status: Status;
  featured_image: string;
}

interface CategoryOption { value: string; label: string; }

interface Props {
  initial?: ArticleFormValues;
  authorId: string;
  backHref: string;
  categories?: CategoryOption[];
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
    .slice(0, 80);
}

function countWordsFromHtml(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").filter(Boolean).length : 0;
}

export default function ArticleEditor({ initial, backHref, categories: categoriesProp }: Props) {
  const categoryOpts: ComboboxOption[] = categoriesProp && categoriesProp.length > 0
    ? categoriesProp.map((c) => ({ value: c.value, label: c.label }))
    : DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [lang, setLang] = useState<Lang>("en");
  const [values, setValues] = useState<ArticleFormValues>(
    initial ?? {
      title_en: "", title_ne: "",
      slug: "",
      excerpt_en: "", excerpt_ne: "",
      content_en: "", content_ne: "",
      category: "",
      tags: [],
      status: "draft",
      featured_image: "",
    }
  );
  const [tagInput, setTagInput] = useState(initial?.tags.join(", ") ?? "");
  const [slugManual, setSlugManual] = useState(!!initial?.id);
  const [saving, setSaving] = useState(false);

  const [imgMode, setImgMode] = useState<ImgMode>("url");
  const [uploading, setUploading] = useState(false);


  const set = useCallback(<K extends keyof ArticleFormValues>(k: K, v: ArticleFormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  }, []);

  function onTitleEnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    set("title_en", val);
    if (!slugManual) set("slug", toSlug(val));
  }

  function onSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  function resetSlugToAuto() {
    setSlugManual(false);
    set("slug", toSlug(values.title_en));
  }

  function onTagInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTagInput(e.target.value);
    const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
    set("tags", tags);
  }

  function removeTag(tag: string) {
    const tags = values.tags.filter((t) => t !== tag);
    set("tags", tags);
    setTagInput(tags.join(", "));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        set("featured_image", data.url);
      } else {
        toast(data.error ?? "Upload failed.", "error");
      }
    } catch {
      toast("Upload error — please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function submit(targetStatus: Status) {
    if (!values.title_en.trim()) {
      toast("English title is required.", "error");
      return;
    }
    if (!values.slug.trim()) {
      toast("Slug is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...values, status: targetStatus };
      const url = isEdit ? `/api/articles/${initial!.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Something went wrong.", "error");
        return;
      }

      toast(targetStatus === "published" ? "Article published!" : targetStatus === "archived" ? "Article archived." : "Saved as draft.", "success");

      if (!isEdit && data.article?.id) {
        router.push(`/en/dashboard/articles/${data.article.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      toast("Network error — please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  const wordCountEn = countWordsFromHtml(values.content_en);
  const wordCountNe = countWordsFromHtml(values.content_ne);

  return (
    <div className={styles.layout}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <a href={backHref} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Articles
          </a>
          <span className={styles.topTitle}>
            {isEdit ? "Edit Article" : "New Article"}
          </span>
        </div>
        <div className={styles.topActions}>
          {isEdit && values.status === "published" && (
            <button
              className={styles.btnSecondary}
              onClick={() => submit("archived")}
              disabled={saving}
            >
              Archive
            </button>
          )}
          <button
            className={styles.btnGhost}
            onClick={() => submit("draft")}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => submit("published")}
            disabled={saving}
          >
            {saving ? "Publishing…" : values.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Left: content editor */}
        <div className={styles.editor}>
          {/* Language tabs */}
          <div className={styles.langTabs}>
            <button
              className={`${styles.langTab} ${lang === "en" ? styles.langTabActive : ""}`}
              onClick={() => setLang("en")}
              type="button"
            >
              English
            </button>
            <button
              className={`${styles.langTab} ${lang === "ne" ? styles.langTabActive : ""}`}
              onClick={() => setLang("ne")}
              type="button"
            >
              नेपाली
            </button>
            <span className={styles.langHint}>
              {lang === "en" ? "Writing in English" : "नेपालीमा लेख्दै"}
            </span>
          </div>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>
              {lang === "en" ? "Title (English)" : "शीर्षक (नेपाली)"}
              {lang === "en" && <span className={styles.required}>*</span>}
            </label>
            {lang === "en" ? (
              <input
                type="text"
                className={styles.titleInput}
                placeholder="Enter article headline…"
                value={values.title_en}
                onChange={onTitleEnChange}
              />
            ) : (
              <input
                type="text"
                className={`${styles.titleInput} ${styles.devanagari}`}
                placeholder="लेखको शीर्षक लेख्नुहोस्…"
                value={values.title_ne}
                onChange={(e) => set("title_ne", e.target.value)}
                lang="ne"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className={styles.field}>
            <label className={styles.label}>
              {lang === "en" ? "Excerpt / Summary" : "सारांश"}
            </label>
            {lang === "en" ? (
              <textarea
                className={styles.excerptInput}
                placeholder="Brief summary shown in article cards…"
                rows={3}
                value={values.excerpt_en}
                onChange={(e) => set("excerpt_en", e.target.value)}
              />
            ) : (
              <textarea
                className={`${styles.excerptInput} ${styles.devanagari}`}
                placeholder="लेख कार्डहरूमा देखिने संक्षिप्त सारांश…"
                rows={3}
                value={values.excerpt_ne}
                onChange={(e) => set("excerpt_ne", e.target.value)}
                lang="ne"
              />
            )}
          </div>

          {/* Content */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                {lang === "en" ? "Content" : "सामग्री"}
              </label>
              <span className={styles.wordCount}>
                {lang === "en"
                  ? `${wordCountEn} words`
                  : `${wordCountNe} शब्द`}
              </span>
            </div>

            {lang === "en" ? (
              <QuillEditor
                key="editor-en"
                initialContent={values.content_en}
                placeholder="Write your article here…"
                onUpdate={(html) => set("content_en", html)}
              />
            ) : (
              <QuillEditor
                key="editor-ne"
                initialContent={values.content_ne}
                placeholder="यहाँ आफ्नो लेख लेख्नुहोस्…"
                onUpdate={(html) => set("content_ne", html)}
                isNepali
              />
            )}
          </div>
        </div>

        {/* Right: metadata sidebar */}
        <aside className={styles.sidebar}>

          {/* Status */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Status</h3>
            <div className={styles.statusBadge} data-status={values.status}>
              {values.status === "draft" && "Draft"}
              {values.status === "published" && "Published"}
              {values.status === "archived" && "Archived"}
            </div>
          </div>

          {/* Slug */}
          <div className={styles.sideCard}>
            <div className={styles.sideTitleRow}>
              <h3 className={styles.sideTitle}>
                URL Slug <span className={styles.required}>*</span>
              </h3>
              {!slugManual ? (
                <span className={styles.slugAutoBadge}>Auto</span>
              ) : (
                values.title_en && (
                  <button
                    type="button"
                    className={styles.slugResetBtn}
                    onClick={resetSlugToAuto}
                  >
                    Reset to auto
                  </button>
                )
              )}
            </div>
            <div className={styles.slugWrap}>
              <span className={styles.slugPrefix}>/article/</span>
              <input
                type="text"
                className={styles.slugInput}
                placeholder="my-article-slug"
                value={values.slug}
                onChange={onSlugChange}
              />
            </div>
            <p className={styles.hint}>Lowercase letters, numbers, hyphens only</p>
          </div>

          {/* Category combobox */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Category</h3>
            <Combobox
              options={categoryOpts}
              value={values.category}
              placeholder="Select category…"
              onChange={(v) => set("category", v)}
            />
          </div>

          {/* Tags */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Tags</h3>
            <input
              type="text"
              className={styles.input}
              placeholder="climate, politics, nepal…"
              value={tagInput}
              onChange={onTagInputChange}
            />
            <p className={styles.hint}>Separate with commas</p>
            {values.tags.length > 0 && (
              <div className={styles.tagChips}>
                {values.tags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured image */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Featured Image</h3>
            <div className={styles.imgModeToggle}>
              <button
                type="button"
                className={`${styles.imgModeBtn} ${imgMode === "url" ? styles.imgModeBtnActive : ""}`}
                onClick={() => setImgMode("url")}
              >
                URL
              </button>
              <button
                type="button"
                className={`${styles.imgModeBtn} ${imgMode === "upload" ? styles.imgModeBtnActive : ""}`}
                onClick={() => setImgMode("upload")}
              >
                Upload
              </button>
            </div>

            {imgMode === "url" ? (
              <input
                type="url"
                className={styles.input}
                placeholder="https://images.unsplash.com/…"
                value={values.featured_image}
                onChange={(e) => set("featured_image", e.target.value)}
              />
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadLabel}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  {uploading ? "Uploading…" : "Choose image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={styles.uploadInput}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
                <p className={styles.hint}>JPEG, PNG, WebP, GIF — max 8 MB</p>
              </div>
            )}

            {values.featured_image && (
              <div className={styles.imgPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.featured_image}
                  alt="Preview"
                  className={styles.imgPreviewImg}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Bilingual progress */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Translation Progress</h3>
            <div className={styles.progressItem}>
              <span>English title</span>
              <span className={values.title_en ? styles.done : styles.missing}>
                {values.title_en ? "Done" : "—"}
              </span>
            </div>
            <div className={styles.progressItem}>
              <span>Nepali title</span>
              <span className={values.title_ne ? styles.done : styles.missing}>
                {values.title_ne ? "Done" : "—"}
              </span>
            </div>
            <div className={styles.progressItem}>
              <span>EN content</span>
              <span className={values.content_en ? styles.done : styles.missing}>
                {values.content_en ? `${wordCountEn}w` : "—"}
              </span>
            </div>
            <div className={styles.progressItem}>
              <span>NE content</span>
              <span className={values.content_ne ? styles.done : styles.missing}>
                {values.content_ne ? `${wordCountNe}w` : "—"}
              </span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

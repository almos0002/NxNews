"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./ArticleEditor.module.css";
import TranslateAllButton from "../ui/TranslateAllButton";
import TranslateButton from "../ui/TranslateButton";
import TranslateFilledHint from "../ui/TranslateFilledHint";

const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => <div className={styles.editorPlaceholder}>Loading editor…</div>,
});

export interface PageFormValues {
  id?: string;
  title_en: string;
  title_ne: string;
  slug: string;
  content_en: string;
  content_ne: string;
  status: "draft" | "published" | "archived";
}

interface Props {
  initial?: PageFormValues;
  authorId: string;
  backHref: string;
}

type Lang = "en" | "ne";
type Status = "draft" | "published" | "archived";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").trim().slice(0, 80);
}

function countWords(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").filter(Boolean).length : 0;
}

export default function PageEditor({ initial, backHref }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [lang, setLang] = useState<Lang>("en");
  const [values, setValues] = useState<PageFormValues>(
    initial ?? { title_en: "", title_ne: "", slug: "", content_en: "", content_ne: "", status: "draft" }
  );
  const [slugManual, setSlugManual] = useState(!!initial?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [contentEnVer, setContentEnVer] = useState(0);
  const [contentNeVer, setContentNeVer] = useState(0);

  const set = useCallback(<K extends keyof PageFormValues>(k: K, v: PageFormValues[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setError(""); setSuccess("");
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

  function resetSlug() { setSlugManual(false); set("slug", toSlug(values.title_en)); }

  function setContent(targetLang: Lang, html: string) {
    if (targetLang === "en") {
      setValues((p) => ({ ...p, content_en: html }));
      setContentEnVer((v) => v + 1);
    } else {
      setValues((p) => ({ ...p, content_ne: html }));
      setContentNeVer((v) => v + 1);
    }
  }

  async function submit(targetStatus: Status) {
    setError(""); setSuccess("");
    if (!values.title_en.trim()) { setError("English title is required."); return; }
    if (!values.slug.trim()) { setError("Slug is required."); return; }
    setSaving(true);
    try {
      const payload = { ...values, status: targetStatus };
      const url = isEdit ? `/api/pages/${initial!.id}` : "/api/pages";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess(targetStatus === "published" ? "Page published!" : "Saved as draft.");
      if (!isEdit && data.page?.id) {
        router.push(`/en/dashboard/pages/${data.page.id}/edit`);
      } else {
        router.refresh();
      }
    } catch { setError("Network error — please try again."); }
    finally { setSaving(false); }
  }

  const wordCountEn = countWords(values.content_en);
  const wordCountNe = countWords(values.content_ne);

  return (
    <div className={styles.layout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <a href={backHref} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            All Pages
          </a>
          <span className={styles.topTitle}>{isEdit ? "Edit Page" : "New Page"}</span>
        </div>
        <div className={styles.topActions}>
          {error && <span className={styles.topError}>{error}</span>}
          {success && <span className={styles.topSuccess}>{success}</span>}
          {isEdit && values.status === "published" && (
            <button className={styles.btnSecondary} onClick={() => submit("archived")} disabled={saving}>Archive</button>
          )}
          <button className={styles.btnGhost} onClick={() => submit("draft")} disabled={saving}>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <TranslateAllButton getFields={() => [
            { id: "page-title-ne", label: "Title", source: values.title_en, target: values.title_ne, sourceLang: "en", targetLang: "ne", setter: (v) => set("title_ne", v) },
            { id: "page-title-en", label: "Title", source: values.title_ne, target: values.title_en, sourceLang: "ne", targetLang: "en", setter: (v) => set("title_en", v) },
            { id: "page-content-ne", label: "Content", source: values.content_en, target: values.content_ne, sourceLang: "en", targetLang: "ne", format: "html", setter: (v) => setContent("ne", v) },
            { id: "page-content-en", label: "Content", source: values.content_ne, target: values.content_en, sourceLang: "ne", targetLang: "en", format: "html", setter: (v) => setContent("en", v) },
          ]} />
          <button className={styles.btnPrimary} onClick={() => submit("published")} disabled={saving}>
            {saving ? "Publishing…" : values.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>
      {/* Body */}
      <div className={styles.body}>
        <div className={styles.editor}>
          {/* Language tabs */}
          <div className={styles.langTabs}>
            <button className={`${styles.langTab} ${lang === "en" ? styles.langTabActive : ""}`} onClick={() => setLang("en")} type="button">English</button>
            <button className={`${styles.langTab} ${lang === "ne" ? styles.langTabActive : ""}`} onClick={() => setLang("ne")} type="button">नेपाली</button>
            <span className={styles.langHint}>{lang === "en" ? "Writing in English" : "नेपालीमा लेख्दै"}</span>
          </div>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>
              {lang === "en" ? "Title (English)" : "शीर्षक (नेपाली)"}
              {lang === "en" && <span className={styles.required}>*</span>}
            </label>
            {lang === "en" ? (
              <input type="text" className={styles.titleInput} placeholder="Page title…" value={values.title_en} onChange={onTitleEnChange} />
            ) : (
              <input type="text" className={`${styles.titleInput} ${styles.devanagari}`} placeholder="पृष्ठ शीर्षक…" value={values.title_ne} onChange={(e) => set("title_ne", e.target.value)} lang="ne" />
            )}
            <div style={{ marginTop: 6 }}>
              <TranslateButton
                source={lang === "en" ? values.title_ne : values.title_en}
                sourceLang={lang === "en" ? "ne" : "en"}
                targetLang={lang}
                currentTarget={lang === "en" ? values.title_en : values.title_ne}
                onTranslated={(v) => set(lang === "en" ? "title_en" : "title_ne", v)}
                label={`Translate title to ${lang === "en" ? "English" : "Nepali"}`}
              />
              <TranslateFilledHint id={lang === "en" ? "page-title-en" : "page-title-ne"} />
            </div>
          </div>

          {/* Content */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>{lang === "en" ? "Content" : "सामग्री"}</label>
              <span className={styles.wordCount}>{lang === "en" ? `${wordCountEn} words` : `${wordCountNe} शब्द`}</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <TranslateButton
                source={lang === "en" ? values.content_ne : values.content_en}
                sourceLang={lang === "en" ? "ne" : "en"}
                targetLang={lang}
                format="html"
                currentTarget={lang === "en" ? values.content_en : values.content_ne}
                onTranslated={(v) => setContent(lang, v)}
                label={`Translate content to ${lang === "en" ? "English" : "Nepali"}`}
              />
              <TranslateFilledHint id={lang === "en" ? "page-content-en" : "page-content-ne"} />
            </div>
            {lang === "en" ? (
              <QuillEditor key="page-en" initialContent={values.content_en} contentVersion={contentEnVer} placeholder="Write page content here…" onUpdate={(html) => set("content_en", html)} />
            ) : (
              <QuillEditor key="page-ne" initialContent={values.content_ne} contentVersion={contentNeVer} placeholder="पृष्ठ सामग्री यहाँ लेख्नुहोस्…" onUpdate={(html) => set("content_ne", html)} isNepali />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Status</h3>
            <div className={styles.statusBadge} data-status={values.status}>
              {values.status === "draft" && "Draft"}
              {values.status === "published" && "Published"}
              {values.status === "archived" && "Archived"}
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sideTitleRow}>
              <h3 className={styles.sideTitle}>URL Slug <span className={styles.required}>*</span></h3>
              {!slugManual ? (
                <span className={styles.slugAutoBadge}>Auto</span>
              ) : values.title_en && (
                <button type="button" className={styles.slugResetBtn} onClick={resetSlug}>Reset to auto</button>
              )}
            </div>
            <div className={styles.slugWrap}>
              <span className={styles.slugPrefix}>/page/</span>
              <input type="text" className={styles.slugInput} placeholder="my-page-slug" value={values.slug} onChange={onSlugChange} />
            </div>
            <p className={styles.hint}>Lowercase letters, numbers, hyphens only</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

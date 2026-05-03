"use client";

import { useState } from "react";
import { toast } from "@/lib/util/toast";
import styles from "./TranslateButton.module.css";

export type TranslateLang = "en" | "ne";
export type TranslateFormat = "plain" | "html";

interface Props {
  /** The text to translate from. */
  source: string;
  /** Source language. */
  sourceLang: TranslateLang;
  /** Target language — also used to label the button. */
  targetLang: TranslateLang;
  /** Plain text or HTML (preserves tags). */
  format?: TranslateFormat;
  /** Current value of the target field — used to confirm before overwriting. */
  currentTarget?: string;
  /** Called with the translated string. */
  onTranslated: (text: string) => void;
  /** Optional override for the button label. */
  label?: string;
  /** Smaller variant for inline rows. */
  compact?: boolean;
  /** Disable the button (e.g. while saving). */
  disabled?: boolean;
}

const LANG_LABEL: Record<TranslateLang, string> = {
  en: "English",
  ne: "Nepali",
};

function IconSparkle() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M5 12H2" />
      <path d="M22 12h-3" />
      <path d="M5.6 5.6l2.1 2.1" />
      <path d="M16.3 16.3l2.1 2.1" />
      <path d="M5.6 18.4l2.1-2.1" />
      <path d="M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

export async function callTranslate(
  text: string,
  sourceLang: TranslateLang,
  targetLang: TranslateLang,
  format: TranslateFormat
): Promise<string> {
  const res = await fetch("/api/ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sourceLang, targetLang, format }),
  });
  let data: { translatedText?: string; error?: string } = {};
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    throw new Error(data.error || `Translation failed (${res.status}).`);
  }
  if (!data.translatedText) {
    throw new Error("Translation returned no text.");
  }
  return data.translatedText;
}

export default function TranslateButton({
  source,
  sourceLang,
  targetLang,
  format = "plain",
  currentTarget,
  onTranslated,
  label,
  compact,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [justFilled, setJustFilled] = useState(false);

  async function run() {
    if (loading || disabled) return;
    if (!source || !source.trim()) {
      toast(`Write some ${LANG_LABEL[sourceLang]} first to translate from.`, "error");
      return;
    }
    if (currentTarget && currentTarget.trim()) {
      const ok = window.confirm(
        `The ${LANG_LABEL[targetLang]} field already has content. Overwrite it with the AI translation?`
      );
      if (!ok) return;
    }
    setLoading(true);
    try {
      const out = await callTranslate(source, sourceLang, targetLang, format);
      onTranslated(out);
      setJustFilled(true);
      toast(`Translated to ${LANG_LABEL[targetLang]}.`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Translation failed.";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const text = label ?? `Translate from ${LANG_LABEL[sourceLang]}`;

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={run}
        disabled={loading || disabled}
        title={`Translate from ${LANG_LABEL[sourceLang]} to ${LANG_LABEL[targetLang]} using AI`}
        style={compact ? { padding: "3px 7px", fontSize: "0.68rem" } : undefined}
      >
        {loading ? <span className={styles.spinner} /> : <IconSparkle />}
        {loading ? "Translating…" : text}
      </button>
      {justFilled && !loading && (
        <span className={styles.hint}>Translated by AI — please review</span>
      )}
    </span>
  );
}

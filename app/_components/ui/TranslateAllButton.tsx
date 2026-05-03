"use client";

import { useState } from "react";
import { toast } from "@/lib/util/toast";
import styles from "./TranslateButton.module.css";
import { callTranslate, type TranslateLang, type TranslateFormat } from "./TranslateButton";
import { markTranslateFilled } from "./translateHints";

export interface TranslateFieldDescriptor {
  /** Human-readable label, used in error toasts. */
  label: string;
  /** Source-language value (the value to translate FROM). */
  source: string;
  /** Current target-language value — skipped if non-empty. */
  target: string;
  /** Source language. */
  sourceLang: TranslateLang;
  /** Target language. */
  targetLang: TranslateLang;
  /** Plain text or HTML. */
  format?: TranslateFormat;
  /** Setter to write the translated value into the form. */
  setter: (translated: string) => void;
  /** Optional unique id — when present, a <TranslateFilledHint id={id}/> rendered near
   *  the field will show "Translated by AI — please review" after batch fills it. */
  id?: string;
}

interface Props {
  /** Returns the list of fields to translate, evaluated each time. */
  getFields: () => TranslateFieldDescriptor[];
  disabled?: boolean;
  className?: string;
}

function IconWand() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4V2" /><path d="M15 16v-2" />
      <path d="M8 9h2" /><path d="M20 9h2" />
      <path d="M17.8 11.8L19 13" /><path d="M15 9h0" />
      <path d="M17.8 6.2L19 5" /><path d="M3 21l9-9" />
      <path d="M12.2 6.2L11 5" />
    </svg>
  );
}

export default function TranslateAllButton({ getFields, disabled, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [filledCount, setFilledCount] = useState(0);

  async function run() {
    if (loading || disabled) return;
    const all = getFields();
    const pending = all.filter((f) => f.source.trim() && !f.target.trim());
    if (pending.length === 0) {
      toast("No empty fields to fill — every translation is already in place.", "info");
      return;
    }
    setLoading(true);
    setFilledCount(0);
    setProgress({ done: 0, total: pending.length });
    let okCount = 0;
    let firstError: string | null = null;
    for (let i = 0; i < pending.length; i++) {
      const f = pending[i];
      try {
        const out = await callTranslate(f.source, f.sourceLang, f.targetLang, f.format ?? "plain");
        f.setter(out);
        if (f.id) markTranslateFilled(f.id);
        okCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Translation failed.";
        if (!firstError) firstError = `${f.label}: ${msg}`;
      }
      setProgress({ done: i + 1, total: pending.length });
    }
    setLoading(false);
    setProgress(null);
    setFilledCount(okCount);
    if (okCount > 0 && !firstError) {
      toast(`Translated ${okCount} field${okCount === 1 ? "" : "s"}.`, "success");
    } else if (okCount > 0 && firstError) {
      toast(`Translated ${okCount} of ${pending.length}. ${firstError}`, "error");
    } else if (firstError) {
      toast(firstError, "error");
    }
  }

  const labelText = loading && progress
    ? `Translating ${progress.done} of ${progress.total}…`
    : "Translate all empty fields";

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={`${styles.btn} ${className ?? ""}`}
        onClick={run}
        disabled={loading || disabled}
        title="Auto-fill every empty translation field in this form"
        style={{ fontSize: "0.75rem", padding: "6px 11px" }}
      >
        {loading ? <span className={styles.spinner} /> : <IconWand />}
        {labelText}
      </button>
      {!loading && filledCount > 0 && (
        <span className={styles.hint}>
          AI filled {filledCount} field{filledCount === 1 ? "" : "s"} — please review
        </span>
      )}
    </span>
  );
}

"use client";

import styles from "./TranslateButton.module.css";
import { useTranslateFilled } from "./translateHints";

export default function TranslateFilledHint({ id }: { id: string }) {
  const filled = useTranslateFilled(id);
  if (!filled) return null;
  return <span className={styles.hint}>Translated by AI — please review</span>;
}

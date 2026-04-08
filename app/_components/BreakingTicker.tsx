"use client";

import { useT } from "@/app/_i18n/LanguageContext";
import styles from "./BreakingTicker.module.css";

export default function BreakingTicker({ headline }: { headline: string }) {
  const t = useT();
  return (
    <div className={styles.ticker} role="marquee" aria-label="Breaking news">
      <div className={styles.inner}>
        <span className={styles.label}>{t("header.live")}</span>
        <p className={styles.text}>{headline}</p>
      </div>
    </div>
  );
}

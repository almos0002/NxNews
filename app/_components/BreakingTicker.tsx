"use client";

import Link from "next/link";
import styles from "./BreakingTicker.module.css";

interface Headline {
  title: string;
  slug: string;
}

interface Props {
  headlines?: Headline[];
  locale?: string;
}

export default function BreakingTicker({ headlines = [], locale = "en" }: Props) {
  if (headlines.length === 0) return null;

  const repeated = headlines.length < 4
    ? [...headlines, ...headlines, ...headlines]
    : [...headlines, ...headlines];

  return (
    <div>
      <div className={styles.ticker} role="marquee" aria-label="Breaking news">
        <div className={styles.inner}>
          <span className={styles.label}>Live</span>
          <div className={styles.scrollTrack}>
            <div className={styles.scrollContent}>
              {repeated.map((h, i) => (
                <span key={i} className={styles.item}>
                  <Link
                    href={`/${locale}/article/${h.slug}`}
                    className={styles.link}
                    prefetch={false}
                  >
                    {h.title}
                  </Link>
                  <span className={styles.sep} aria-hidden="true">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.strip} aria-hidden="true" />
    </div>
  );
}

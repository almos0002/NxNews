"use client";

import Link from "next/link";
import styles from "./BreakingTicker.module.css";

interface Headline {
  title: string;
  slug: string;
}

interface Props {
  headlines?: Headline[];
  headline?: string;
  locale?: string;
}

export default function BreakingTicker({ headlines, headline, locale = "en" }: Props) {
  const resolved: Headline[] = headlines?.length
    ? headlines
    : headline
      ? [{ title: headline, slug: "" }]
      : [];

  if (resolved.length === 0) return null;

  const repeated = resolved.length < 4
    ? [...resolved, ...resolved, ...resolved]
    : [...resolved, ...resolved];

  return (
    <div className={styles.wrapper}>
      <div className={styles.ticker} role="marquee" aria-label="Breaking news">
        <div className={styles.inner}>
          <span className={styles.label}>Live</span>
          <div className={styles.scrollTrack}>
            <div className={styles.scrollContent}>
              {repeated.map((h, i) => (
                <span key={i} className={styles.item}>
                  {h.slug ? (
                    <Link
                      href={`/${locale}/article/${h.slug}`}
                      className={styles.link}
                      prefetch={false}
                    >
                      {h.title}
                    </Link>
                  ) : (
                    <span className={styles.link}>{h.title}</span>
                  )}
                  <span className={styles.sep} aria-hidden="true">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.goldStrip} aria-hidden="true" />
      <div className={styles.stripWrap} aria-hidden="true">
        <div className={styles.strip} />
      </div>
    </div>
  );
}

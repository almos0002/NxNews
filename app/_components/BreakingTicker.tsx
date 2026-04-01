import styles from "./BreakingTicker.module.css";

export default function BreakingTicker({ headline }: { headline: string }) {
  return (
    <div className={styles.ticker} role="marquee" aria-label="Breaking news">
      <span className={styles.label}>Breaking</span>
      <div className={styles.trackWrapper}>
        <div className={styles.track}>
          <span className={styles.text}>{headline}</span>
          <span className={styles.separator} aria-hidden="true">
            &#9679;
          </span>
          <span className={styles.text}>{headline}</span>
          <span className={styles.separator} aria-hidden="true">
            &#9679;
          </span>
        </div>
      </div>
    </div>
  );
}

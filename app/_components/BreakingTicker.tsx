import styles from "./BreakingTicker.module.css";

export default function BreakingTicker({ headline = "" }: { headline?: string }) {
  return (
    <div>
      <div className={styles.ticker} role="marquee" aria-label="Breaking news">
        <div className={styles.inner}>
          <span className={styles.label}>Live</span>
          <p className={styles.text}>{headline}</p>
        </div>
      </div>
      <div className={styles.strip} aria-hidden="true" />
    </div>
  );
}

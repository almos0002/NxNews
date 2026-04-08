import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <span className={styles.logoMark}>DR</span>
              <span className={styles.logoText}>The Daily Report</span>
            </div>
            <p className={styles.description}>
              Independent, in-depth journalism for a complex world. Delivering
              clarity through rigorous reporting since 2024.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Sections</h3>
              <ul className={styles.linkList}>
                <li><a href="/world">World</a></li>
                <li><a href="/politics">Politics</a></li>
                <li><a href="/business">Business</a></li>
                <li><a href="/technology">Technology</a></li>
                <li><a href="/science">Science</a></li>
                <li><a href="/culture">Culture</a></li>
              </ul>
            </div>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Company</h3>
              <ul className={styles.linkList}>
                <li><a href="/about">About</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/advertise">Advertise</a></li>
                <li><a href="/ethics">Ethics Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; 2026 The Daily Report</span>
          <div className={styles.bottomLinks}>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

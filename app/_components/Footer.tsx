import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRule} />
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h2 className={styles.title}>The Daily Report</h2>
            <p className={styles.description}>
              Delivering independent, in-depth journalism to readers worldwide.
              Our commitment is to truth, clarity, and the stories that matter.
            </p>
          </div>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Sections</h3>
            <ul className={styles.linkList}>
              <li><a href="#">World</a></li>
              <li><a href="#">Politics</a></li>
              <li><a href="#">Business</a></li>
              <li><a href="#">Technology</a></li>
              <li><a href="#">Science</a></li>
              <li><a href="#">Culture</a></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Advertise</a></li>
              <li><a href="#">Ethics Policy</a></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Subscribe</h3>
            <p className={styles.subscribeText}>
              Get unlimited access to award-winning journalism.
            </p>
            <a href="#" className={styles.subscribeBtn}>
              Subscribe Now
            </a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>&copy; 2026 The Daily Report. All rights reserved.</span>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import styles from "./Header.module.css";
import { categories } from "@/app/_data/articles";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Mobile: hamburger (left) */}
        <MobileNav />

        <div className={styles.brand}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoMark}>DR</span>
            <span className={styles.logoText}>The Daily Report</span>
          </a>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {categories.map((cat) => (
              <li key={cat}>
                <a href={`/${cat.toLowerCase()}`} className={styles.navLink}>
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href="/subscribe" className={styles.subscribeLink}>Subscribe</a>
        </div>

      </div>
    </header>
  );
}

import styles from "./Header.module.css";
import { categories } from "@/app/_data/articles";

export default function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span className={styles.date}>{today}</span>
        <span className={styles.edition}>Today&apos;s Edition</span>
      </div>

      <div className={styles.masthead}>
        <div className={styles.mastheadRule} />
        <h1 className={styles.title}>The Daily Report</h1>
        <p className={styles.tagline}>
          Independent journalism since 2024
        </p>
        <div className={styles.mastheadRule} />
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
    </header>
  );
}

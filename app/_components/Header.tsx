"use client";

import { useT } from "@/app/_i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";
import { categories } from "@/app/_data/articles";
import styles from "./Header.module.css";

export default function Header() {
  const t = useT();

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
                  {t(`nav.${cat.toLowerCase()}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <a href="/subscribe" className={styles.subscribeLink}>
            {t("nav.subscribe")}
          </a>
        </div>

      </div>
    </header>
  );
}

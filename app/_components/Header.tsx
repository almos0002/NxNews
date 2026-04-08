import { getTranslations } from "next-intl/server";
import { categories } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";
import styles from "./Header.module.css";

export default async function Header() {
  const t = await getTranslations("nav");

  const catKeys: Record<string, string> = {
    World: "world",
    Politics: "politics",
    Business: "business",
    Technology: "technology",
    Science: "science",
    Culture: "culture",
    Opinion: "opinion",
    Sports: "sports",
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <MobileNav />

        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>DR</span>
            <span className={styles.logoText}>The Daily Report</span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/${cat.toLowerCase()}`}
                  className={styles.navLink}
                >
                  {t(catKeys[cat] ?? cat.toLowerCase())}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <Link href="/subscribe" className={styles.subscribeLink}>
            {t("subscribe")}
          </Link>
        </div>
      </div>
    </header>
  );
}

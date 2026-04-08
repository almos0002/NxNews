import Image from "next/image";
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
    Videos: "videos",
    Weather: "weather",
    Entertainment: "entertainment",
  };

  return (
    <header className={styles.header}>
      {/* ── Row 1: logo centred, actions right ── */}
      <div className={styles.logoRow}>
        <MobileNav />

        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="KumariHub"
            width={260}
            height={75}
            style={{ objectFit: "contain", height: "58px", width: "auto" }}
            priority
          />
        </Link>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <Link href="/subscribe" className={styles.subscribeLink}>
            {t("subscribe")}
          </Link>
        </div>
      </div>

      {/* ── Row 2: navigation ── */}
      <div className={styles.navRow}>
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
      </div>
    </header>
  );
}

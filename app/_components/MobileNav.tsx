"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { categories } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import styles from "./MobileNav.module.css";

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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        aria-expanded={open}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.drawerLogo} onClick={() => setOpen(false)}>
            <span className={styles.drawerLogoMark}>DR</span>
            <span className={styles.drawerLogoText}>The Daily Report</span>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile navigation">
          <ul className={styles.drawerList}>
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/${cat.toLowerCase()}`}
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  {t(catKeys[cat] ?? cat.toLowerCase())}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          <Link
            href="/subscribe"
            className={styles.drawerSubscribe}
            onClick={() => setOpen(false)}
          >
            {t("subscribe")}
          </Link>
        </div>
      </div>
    </>
  );
}

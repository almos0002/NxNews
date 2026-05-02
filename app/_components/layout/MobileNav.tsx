"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { MenuItem } from "@/lib/cms/menu";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./MobileNav.module.css";

interface Props {
  navItems: MenuItem[];
  locale: string;
}

export default function MobileNav({ navItems, locale }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function label(item: MenuItem): string {
    return (locale === "ne" && item.label_ne) ? item.label_ne : item.label_en;
  }

  function resolveHref(item: MenuItem): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    if (item.link_type === "category") return `/${item.url}`;
    return item.url || "#";
  }

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
          <Link href="/" className={styles.drawerLogoLink} onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="KumariHub" className={styles.drawerLogoImg} />
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

        <div className={styles.drawerSearch}>
          <Link href="/search" className={styles.drawerSearchLink} onClick={() => setOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t("search")}
          </Link>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile navigation">
          <ul className={styles.drawerList}>
            {navItems.map((item) => {
              const href = resolveHref(item);
              const isExternal = item.link_type === "external" && (href.startsWith("http") || href.startsWith("//"));
              return (
                <li key={item.id}>
                  {isExternal || item.open_new_tab ? (
                    <a
                      href={href}
                      className={styles.drawerLink}
                      target={item.open_new_tab ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                    >
                      {label(item)}
                    </a>
                  ) : (
                    <Link
                      href={href as Parameters<typeof Link>[0]["href"]}
                      className={styles.drawerLink}
                      onClick={() => setOpen(false)}
                    >
                      {label(item)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          <div className={styles.drawerLangRow}>
            <span className={styles.drawerLangLabel}>Language</span>
            <LanguageSwitcher variant="drawer" />
          </div>
        </div>
      </div>
    </>
  );
}

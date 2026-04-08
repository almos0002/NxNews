"use client";

import { useState, useEffect } from "react";
import { categories } from "@/app/_data/articles";
import styles from "./MobileNav.module.css";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
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
          <a href="/" className={styles.drawerLogo} onClick={() => setOpen(false)}>
            <span className={styles.drawerLogoMark}>DR</span>
            <span className={styles.drawerLogoText}>The Daily Report</span>
          </a>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
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
                <a
                  href={`/${cat.toLowerCase()}`}
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          <a href="/subscribe" className={styles.drawerSubscribe} onClick={() => setOpen(false)}>
            Subscribe
          </a>
        </div>
      </div>
    </>
  );
}

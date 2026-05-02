"use client";

import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import styles from "./UserMenu.module.css";

interface Props {
  name: string;
  email: string;
  accountHref: string;
  accountLabel: string;
  locale: string;
}

export default function UserMenu({ name, email, accountHref, accountLabel, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initial = name.charAt(0).toUpperCase() || "U";
  const firstName = name.split(" ")[0] || "Account";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    await authClient.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <div ref={ref} className={styles.root}>
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.name}>{firstName}</span>
        <svg
          className={`${styles.caret} ${open ? styles.caretOpen : ""}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {/* User info */}
          <div className={styles.userInfo}>
            <span className={styles.avatarLg}>{initial}</span>
            <div className={styles.userText}>
              <p className={styles.userName}>{name}</p>
              <p className={styles.userEmail}>{email}</p>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Links */}
          <a href={accountHref} className={styles.item} onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {accountLabel}
          </a>

          <div className={styles.divider} />

          {/* Logout */}
          <button
            className={`${styles.item} ${styles.logout}`}
            onClick={logout}
            disabled={loggingOut}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

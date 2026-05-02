"use client";

import { useEffect, useState, useCallback } from "react";
import type { ToastPayload } from "@/lib/util/toast";
import styles from "./Toaster.module.css";

function IconSuccess() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconError() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

interface ToastItem extends ToastPayload {
  exiting?: boolean;
}

const DURATION = 4000;

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      const payload = (e as CustomEvent<ToastPayload>).detail;
      setToasts((prev) => [...prev.slice(-4), payload]);
      setTimeout(() => dismiss(payload.id), DURATION);
    }
    window.addEventListener("kh:toast", handler);
    return () => window.removeEventListener("kh:toast", handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.wrap} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            styles.toast,
            t.type === "success" ? styles.toastSuccess : t.type === "error" ? styles.toastError : styles.toastInfo,
            t.exiting ? styles.exiting : "",
          ].join(" ")}
          role={t.type === "error" ? "alert" : "status"}
        >
          <span className={[styles.icon, t.type === "success" ? styles.iconSuccess : t.type === "error" ? styles.iconError : styles.iconInfo].join(" ")}>
            {t.type === "success" ? <IconSuccess /> : t.type === "error" ? <IconError /> : <IconInfo />}
          </span>
          <span className={styles.msg}>{t.message}</span>
          <button className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <IconClose />
          </button>
        </div>
      ))}
    </div>
  );
}

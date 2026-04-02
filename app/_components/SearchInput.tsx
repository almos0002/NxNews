"use client";

import { useRef } from "react";
import styles from "./SearchInput.module.css";

export default function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form method="GET" action="/search" className={styles.form} role="search">
      <div className={styles.inputWrap}>
        <svg
          className={styles.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search articles, topics, authors…"
          className={styles.input}
          autoComplete="off"
          aria-label="Search"
          autoFocus
        />
        {defaultValue && (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label="Clear search"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              inputRef.current?.focus();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <button type="submit" className={styles.submitBtn}>Search</button>
    </form>
  );
}

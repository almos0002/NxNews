"use client";

import { useState, useRef, useEffect, useId } from "react";
import styles from "./Combobox.module.css";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export default function Combobox({
  options, value, onChange, placeholder = "— select —", disabled = false, searchable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.hint ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : options;

  function openList() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const trigger = triggerRef.current;
      const list = listRef.current?.closest("[data-combobox]") as HTMLElement | null;
      if (trigger && !trigger.contains(e.target as Node) && list && !list.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className={styles.root} data-combobox>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${disabled ? styles.disabled : ""}`}
        onClick={openList}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? styles.selectedLabel : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`${styles.caret} ${open ? styles.caretOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} onKeyDown={handleKeyDown}>
          {searchable && (
            <div className={styles.searchRow}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.45 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <ul ref={listRef} className={styles.list} role="listbox">
            {placeholder && (
              <li
                className={`${styles.option} ${!value ? styles.optionActive : ""}`}
                role="option"
                aria-selected={!value}
                onMouseDown={() => pick("")}
              >
                <span className={styles.optionLabel}>{placeholder}</span>
              </li>
            )}
            {filtered.length === 0 && (
              <li className={styles.empty}>No results</li>
            )}
            {filtered.map((o) => (
              <li
                key={o.value}
                className={`${styles.option} ${o.value === value ? styles.optionActive : ""}`}
                role="option"
                aria-selected={o.value === value}
                onMouseDown={() => pick(o.value)}
              >
                <span className={styles.optionLabel}>{o.label}</span>
                {o.hint && <span className={styles.optionHint}>{o.hint}</span>}
                {o.value === value && (
                  <svg className={styles.check} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

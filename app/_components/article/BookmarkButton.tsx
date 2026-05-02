"use client";

import { useState } from "react";

interface Props {
  articleId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}

export default function BookmarkButton({ articleId, initialBookmarked, isLoggedIn }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      window.location.href = `/en/login?from=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (res.ok) {
        const data = await res.json() as { bookmarked: boolean };
        setBookmarked(data.bookmarked);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Bookmark this article"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        background: bookmarked ? "var(--color-ink)" : "transparent",
        color: bookmarked ? "#fff" : "var(--color-ink-muted)",
        border: `1.5px solid ${bookmarked ? "var(--color-ink)" : "var(--color-border)"}`,
        borderRadius: 7,
        fontFamily: "var(--font-serif)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}

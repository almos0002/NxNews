import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "404 — Page Not Found | KumariHub",
  robots: { index: false, follow: false },
};

export default async function LocaleNotFound() {
  let locale = "en";
  try { locale = await getLocale(); } catch { /* fallback */ }
  const isNe = locale === "ne";

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          {/* Decorative rule */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 32 }}>
            <span style={{ height: 1, width: 48, background: "var(--color-accent)", display: "block" }} />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              {isNe ? "पृष्ठ फेला परेन" : "Page Not Found"}
            </span>
            <span style={{ height: 1, width: 48, background: "var(--color-accent)", display: "block" }} />
          </div>

          {/* 404 number */}
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(5rem, 18vw, 9rem)",
              fontWeight: 900,
              lineHeight: 1,
              color: "var(--color-accent)",
              margin: "0 0 8px",
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            404
          </p>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
              fontWeight: 700,
              margin: "0 0 16px",
              color: "var(--color-ink)",
            }}
          >
            {isNe
              ? "यो पृष्ठ अवस्थित छैन।"
              : "This page doesn't exist."}
          </h1>

          {/* Description */}
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              color: "var(--color-ink-muted)",
              lineHeight: 1.7,
              margin: "0 0 36px",
            }}
          >
            {isNe
              ? "तपाईंले खोज्नु भएको लेख वा पृष्ठ सार्नु भएको, हटाइएको वा कहिल्यै अस्तित्वमा नरहेको हुन सक्छ।"
              : "The article or page you were looking for may have been moved, removed, or never existed. Try searching or browse the homepage."}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-accent)",
                color: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "11px 24px",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {isNe ? "गृहपृष्ठ" : "Homepage"}
            </Link>
            <Link
              href="/search"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                color: "var(--color-ink)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "11px 24px",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                border: "1.5px solid var(--color-border)",
                transition: "border-color 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {isNe ? "खोज्नुहोस्" : "Search"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

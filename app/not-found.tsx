import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — KumariHub",
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <div style={{ margin: 0, fontFamily: "Georgia, serif", background: "#f5f5f0", color: "#141414", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 560 }}>
        <div style={{ fontSize: "0.72rem", fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e63946", marginBottom: 16 }}>
          KumariHub
        </div>
        <h1 style={{ fontSize: "7rem", fontWeight: 900, lineHeight: 1, color: "#e63946", margin: "0 0 8px", letterSpacing: "-0.04em" }}>
          404
        </h1>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 12px" }}>
          Page not found
        </h2>
        <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6, margin: "0 0 32px" }}>
          The page you were looking for may have been moved, removed, or never existed.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/en" style={{ display: "inline-block", background: "#e63946", color: "#fff", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600, padding: "10px 22px", borderRadius: 6, textDecoration: "none" }}>
            Go to Homepage
          </Link>
          <Link href="/en/search" style={{ display: "inline-block", background: "transparent", color: "#141414", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem", fontWeight: 600, padding: "10px 22px", borderRadius: 6, textDecoration: "none", border: "1.5px solid #d0d0c8" }}>
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  );
}

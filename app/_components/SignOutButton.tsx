"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface Props {
  variant?: "light" | "dark";
}

export default function SignOutButton({ variant = "light" }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/en/login");
    router.refresh();
  }

  if (variant === "dark") {
    return (
      <button
        onClick={handleSignOut}
        style={{
          background: "transparent",
          border: "none",
          fontFamily: "Georgia, serif",
          fontSize: "0.83rem",
          color: "#5c6880",
          cursor: "pointer",
          padding: 0,
          transition: "color 0.12s ease",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#e05c6a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#5c6880";
        }}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: "100%",
        padding: "9px 12px",
        background: "transparent",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        fontFamily: "var(--font-serif)",
        fontSize: "0.83rem",
        color: "var(--color-ink-muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
        (e.currentTarget as HTMLButtonElement).style.color = "#b91c1c";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#fecaca";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-ink-muted)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  );
}

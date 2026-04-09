"use client";

import { useState } from "react";
import styles from "./cms.module.css";
import type { AdSlotConfig } from "@/lib/ads";

interface Props {
  initialAds: AdSlotConfig[];
}

function ToggleSwitch({ enabled, busy, onToggle }: { enabled: boolean; busy: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.toggleSwitch} ${enabled ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
      onClick={onToggle}
      disabled={busy}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable ad slot" : "Enable ad slot"}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

export default function AdsClient({ initialAds }: Props) {
  const [ads, setAds] = useState(initialAds);
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function toggleEnabled(slot: string, current: boolean) {
    setSaving(slot);
    setMsg("");
    try {
      const res = await fetch(`/api/ads/${slot}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Failed");
        return;
      }
      setAds((p) => p.map((a) => (a.slot === slot ? { ...a, enabled: !current } : a)));
    } finally {
      setSaving(null);
    }
  }

  function openEdit(ad: AdSlotConfig) {
    setEditSlot(ad.slot);
    setEditCode(ad.code);
    setMsg("");
  }

  async function saveCode() {
    if (!editSlot) return;
    setSaving(editSlot);
    setMsg("");
    try {
      const res = await fetch(`/api/ads/${editSlot}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Failed");
        return;
      }
      setAds((p) => p.map((a) => (a.slot === editSlot ? { ...a, code: editCode } : a)));
      setEditSlot(null);
      setMsg("Saved successfully.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className={styles.pageTitle}>Ad Management</h1>
        <p className={styles.pageSubtitle}>
          Enable or disable each ad slot and paste ad network code (e.g. Google AdSense, custom HTML).
          Disabled slots show nothing on the site.
        </p>
      </div>

      {msg && <div className={styles.successBanner} style={{ marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ads.map((ad) => (
          <div key={ad.slot} className={styles.tableCard} style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <ToggleSwitch
                  enabled={ad.enabled}
                  busy={saving === ad.slot}
                  onToggle={() => toggleEnabled(ad.slot, ad.enabled)}
                />
                <div>
                  <strong style={{ fontSize: "0.95rem" }}>{ad.label}</strong>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", fontFamily: "monospace", marginTop: 2 }}>
                    slot: {ad.slot}
                    {ad.width > 0 && ` · ${ad.width}×${ad.height}px`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: "0.78rem",
                  color: ad.code ? "var(--color-success, #059669)" : "var(--color-ink-muted)",
                  fontStyle: "italic",
                }}>
                  {ad.code ? "Ad code configured" : "No ad code yet"}
                </span>
                <button
                  className={styles.editBtn}
                  onClick={() => editSlot === ad.slot ? setEditSlot(null) : openEdit(ad)}
                >
                  {editSlot === ad.slot ? "Cancel" : "Edit Code"}
                </button>
              </div>
            </div>

            {editSlot === ad.slot && (
              <div style={{ marginTop: 16 }}>
                <label className={styles.label} style={{ marginBottom: 6, display: "block" }}>
                  Ad Code / HTML / Script
                </label>
                <textarea
                  className={styles.textarea}
                  rows={6}
                  placeholder={`Paste your ad network code here (e.g. Google AdSense <script> tag, custom HTML banner).\nLeave empty to show a placeholder.`}
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
                />
                <div className={styles.actionRow} style={{ marginTop: 10 }}>
                  <button
                    className={styles.submitBtn}
                    onClick={saveCode}
                    disabled={saving === ad.slot}
                  >
                    {saving === ad.slot ? "Saving…" : "Save Code"}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => { setEditSlot(null); setMsg(""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.tableCard} style={{ marginTop: 24, padding: 16, background: "var(--color-bg-alt, #f8f8f4)" }}>
        <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 8 }}>How ads work on KumariHub</h3>
        <ul style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)", lineHeight: 1.7, paddingLeft: 18 }}>
          <li>Each slot corresponds to an ad placement on the site (article pages, homepage, video pages, sidebars).</li>
          <li>If a slot is <strong>disabled</strong>, that placement shows nothing (no empty space).</li>
          <li>If a slot is <strong>enabled with no code</strong>, it shows a placeholder wireframe (useful during setup).</li>
          <li>If a slot is <strong>enabled with code</strong>, the exact HTML/script is rendered on the site.</li>
          <li>Ad changes take effect immediately on the next page load.</li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "@/lib/util/toast";
import styles from "./cms.module.css";
import type { AdSlotConfig } from "@/lib/cms/ads";

interface Props {
  initialAds: AdSlotConfig[];
}

export default function AdsClient({ initialAds }: Props) {
  const [ads, setAds] = useState(initialAds);
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function toggleEnabled(slot: string, current: boolean) {
    setSaving(slot);
    try {
      const res = await fetch(`/api/ads/${slot}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !current }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update slot", "error"); return; }
      setAds((p) => p.map((a) => (a.slot === slot ? { ...a, enabled: !current } : a)));
      toast(!current ? "Ad slot enabled." : "Ad slot disabled.", "success");
    } finally {
      setSaving(null);
    }
  }

  function openEdit(ad: AdSlotConfig) {
    setEditSlot(ad.slot);
    setEditCode(ad.code);
  }

  async function saveCode() {
    if (!editSlot) return;
    setSaving(editSlot);
    try {
      const res = await fetch(`/api/ads/${editSlot}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editCode }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to save code", "error"); return; }
      setAds((p) => p.map((a) => (a.slot === editSlot ? { ...a, code: editCode } : a)));
      setEditSlot(null);
      toast("Ad code saved successfully.", "success");
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

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {ads.map((ad) => (
          <div key={ad.slot} className={styles.tableCard} style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <label className={styles.toggle} style={{ opacity: saving === ad.slot ? 0.6 : 1 }}>
                <span className={styles.toggleTrack} data-on={String(ad.enabled)}>
                  <span className={styles.toggleThumb} />
                </span>
                <input
                  type="checkbox"
                  style={{ display: "none" }}
                  checked={ad.enabled}
                  disabled={saving === ad.slot}
                  onChange={() => toggleEnabled(ad.slot, ad.enabled)}
                />
                <div>
                  <span className={styles.toggleLabel}>{ad.label}</span>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", fontFamily: "monospace", marginTop: 2 }}>
                    slot: {ad.slot}
                    {ad.width > 0 && ` · ${ad.width}×${ad.height}px`}
                  </div>
                </div>
              </label>

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
                    onClick={() => setEditSlot(null)}
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
        <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 8 }}>How ads work</h3>
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

import { pool } from "./db";

export interface AdSlotConfig {
  slot: string;
  label: string;
  width: number;
  height: number;
  enabled: boolean;
  code: string;
  updated_at: string;
}

const DEFAULT_SLOTS: Omit<AdSlotConfig, "updated_at">[] = [
  { slot: "leaderboard", label: "Leaderboard (728×90)",   width: 728, height: 90,  enabled: true, code: "" },
  { slot: "billboard",   label: "Billboard (970×250)",    width: 970, height: 250, enabled: true, code: "" },
  { slot: "rectangle",   label: "Rectangle (300×250)",    width: 300, height: 250, enabled: true, code: "" },
  { slot: "halfpage",    label: "Half Page (300×600)",    width: 300, height: 600, enabled: true, code: "" },
  { slot: "fluid",       label: "Fluid / Sponsored",      width: 0,   height: 0,   enabled: true, code: "" },
];

// Schema is managed by scripts/schema.sql. This function now only seeds
// the default ad slot rows. It should be called explicitly from a one-off
// setup step (e.g. dashboard "reset ads" button), NOT on every request.
export async function initAdsTable(): Promise<void> {
  for (const s of DEFAULT_SLOTS) {
    await pool.query(
      `INSERT INTO ads (slot, enabled, code, width, height)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slot) DO NOTHING`,
      [s.slot, s.enabled, s.code, s.width, s.height]
    );
  }
}

export async function getAllAds(): Promise<AdSlotConfig[]> {
  const { rows } = await pool.query(
    "SELECT slot, enabled, code, width, height, updated_at FROM ads ORDER BY slot"
  );
  return rows;
}

export async function getAd(slot: string): Promise<AdSlotConfig | null> {
  try {
    const { rows } = await pool.query("SELECT * FROM ads WHERE slot=$1", [slot]);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function updateAd(
  slot: string,
  data: { enabled?: boolean; code?: string }
): Promise<AdSlotConfig | null> {
  const fields: string[] = [];
  const params: unknown[] = [slot];

  if (data.enabled !== undefined) { params.push(data.enabled); fields.push(`enabled=$${params.length}`); }
  if (data.code    !== undefined) { params.push(data.code);    fields.push(`code=$${params.length}`); }
  if (!fields.length) return null;

  fields.push("updated_at=NOW()");

  const { rows } = await pool.query(
    `UPDATE ads SET ${fields.join(", ")} WHERE slot=$1 RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

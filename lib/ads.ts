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

export async function initAdsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ads (
      slot        VARCHAR(50)  PRIMARY KEY,
      label       VARCHAR(100) NOT NULL,
      width       INTEGER      NOT NULL DEFAULT 0,
      height      INTEGER      NOT NULL DEFAULT 0,
      enabled     BOOLEAN      DEFAULT true,
      code        TEXT         DEFAULT '',
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  for (const s of DEFAULT_SLOTS) {
    await pool.query(
      `INSERT INTO ads (slot, label, width, height, enabled, code)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slot) DO NOTHING`,
      [s.slot, s.label, s.width, s.height, s.enabled, s.code]
    );
  }
}

export async function getAllAds(): Promise<AdSlotConfig[]> {
  await initAdsTable();
  const { rows } = await pool.query("SELECT * FROM ads ORDER BY slot");
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

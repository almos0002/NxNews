import { pool } from "./db";

export interface EventPhotoImage {
  url: string;
  caption_en?: string;
  caption_ne?: string;
}

export interface EventPhoto {
  id: string;
  title_en: string;
  title_ne: string | null;
  description_en: string | null;
  description_ne: string | null;
  location_en: string | null;
  location_ne: string | null;
  event_date: string | null;
  cover_image: string | null;
  images: EventPhotoImage[];
  slug: string;
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_photos (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      title_en    TEXT        NOT NULL,
      title_ne    TEXT,
      description_en TEXT,
      description_ne TEXT,
      location_en TEXT,
      location_ne TEXT,
      event_date  DATE,
      cover_image TEXT,
      images      JSONB       NOT NULL DEFAULT '[]'::jsonb,
      slug        TEXT        UNIQUE NOT NULL,
      status      TEXT        NOT NULL DEFAULT 'published'
                              CHECK (status IN ('published','draft')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS event_photos_status_idx ON event_photos(status);
    CREATE INDEX IF NOT EXISTS event_photos_slug_idx   ON event_photos(slug);
    CREATE INDEX IF NOT EXISTS event_photos_date_idx   ON event_photos(event_date DESC NULLS LAST);
  `);
}

function row(r: Record<string, unknown>): EventPhoto {
  return {
    ...r,
    images: Array.isArray(r.images) ? r.images : (r.images ? JSON.parse(r.images as string) : []),
  } as EventPhoto;
}

export async function listEventPhotos(opts?: {
  limit?: number;
  offset?: number;
  status?: "published" | "draft" | "all";
}): Promise<EventPhoto[]> {
  await ensureTable();
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  const st = opts?.status ?? "all";

  if (st === "all") {
    const { rows } = await pool.query(
      "SELECT * FROM event_photos ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return rows.map(row);
  }
  const { rows } = await pool.query(
    "SELECT * FROM event_photos WHERE status=$1 ORDER BY event_date DESC NULLS LAST, created_at DESC LIMIT $2 OFFSET $3",
    [st, limit, offset]
  );
  return rows.map(row);
}

export async function countEventPhotos(opts?: { status?: "published" | "draft" | "all" }): Promise<number> {
  await ensureTable();
  const st = opts?.status ?? "all";
  if (st === "all") {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS cnt FROM event_photos");
    return rows[0]?.cnt ?? 0;
  }
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS cnt FROM event_photos WHERE status=$1", [st]
  );
  return rows[0]?.cnt ?? 0;
}

export async function getEventPhotoById(id: string): Promise<EventPhoto | null> {
  await ensureTable();
  const { rows } = await pool.query("SELECT * FROM event_photos WHERE id=$1", [id]);
  return rows[0] ? row(rows[0]) : null;
}

export async function getEventPhotoBySlug(slug: string): Promise<EventPhoto | null> {
  await ensureTable();
  const { rows } = await pool.query(
    "SELECT * FROM event_photos WHERE slug=$1 AND status='published'", [slug]
  );
  return rows[0] ? row(rows[0]) : null;
}

export async function createEventPhoto(
  data: Omit<EventPhoto, "id" | "created_at" | "updated_at">
): Promise<EventPhoto> {
  await ensureTable();
  const { rows } = await pool.query(
    `INSERT INTO event_photos
       (title_en, title_ne, description_en, description_ne,
        location_en, location_ne, event_date, cover_image, images, slug, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
     RETURNING *`,
    [
      data.title_en, data.title_ne ?? null,
      data.description_en ?? null, data.description_ne ?? null,
      data.location_en ?? null, data.location_ne ?? null,
      data.event_date ?? null, data.cover_image ?? null,
      JSON.stringify(data.images ?? []), data.slug, data.status,
    ]
  );
  return row(rows[0]);
}

export async function updateEventPhoto(
  id: string,
  data: Partial<Omit<EventPhoto, "id" | "created_at" | "updated_at">>
): Promise<EventPhoto | null> {
  await ensureTable();
  const fields: string[] = [];
  const vals: unknown[] = [id];
  let i = 2;

  const add = (col: string, val: unknown) => { fields.push(`${col}=$${i++}`); vals.push(val); };

  if (data.title_en !== undefined) add("title_en", data.title_en);
  if (data.title_ne !== undefined) add("title_ne", data.title_ne);
  if (data.description_en !== undefined) add("description_en", data.description_en);
  if (data.description_ne !== undefined) add("description_ne", data.description_ne);
  if (data.location_en !== undefined) add("location_en", data.location_en);
  if (data.location_ne !== undefined) add("location_ne", data.location_ne);
  if (data.event_date !== undefined) add("event_date", data.event_date || null);
  if (data.cover_image !== undefined) add("cover_image", data.cover_image || null);
  if (data.images !== undefined) add("images", JSON.stringify(data.images));
  if (data.slug !== undefined) add("slug", data.slug);
  if (data.status !== undefined) add("status", data.status);

  if (fields.length === 0) return getEventPhotoById(id);

  fields.push(`updated_at=NOW()`);
  const { rows } = await pool.query(
    `UPDATE event_photos SET ${fields.join(",")} WHERE id=$1 RETURNING *`, vals
  );
  return rows[0] ? row(rows[0]) : null;
}

export async function deleteEventPhoto(id: string): Promise<boolean> {
  await ensureTable();
  const { rowCount } = await pool.query("DELETE FROM event_photos WHERE id=$1", [id]);
  return (rowCount ?? 0) > 0;
}

export function toEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

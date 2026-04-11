import { pool } from "./db";

export interface Video {
  id: string;
  title_en: string;
  title_ne: string;
  youtube_url: string;
  description_en: string;
  description_ne: string;
  thumbnail: string;
  category: string;
  duration: string;
  status: "published" | "draft";
  author_id: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

export async function listVideos(): Promise<Video[]> {
  const { rows } = await pool.query("SELECT * FROM videos ORDER BY created_at DESC");
  return rows;
}

export async function getVideoById(id: string): Promise<Video | null> {
  const { rows } = await pool.query("SELECT * FROM videos WHERE id=$1", [id]);
  return rows[0] ?? null;
}

export async function createVideo(data: Omit<Video, "id" | "created_at" | "updated_at">): Promise<Video> {
  const { rows } = await pool.query(
    `INSERT INTO videos (title_en,title_ne,youtube_url,description_en,description_ne,thumbnail,category,duration,status,author_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.title_en, data.title_ne, data.youtube_url, data.description_en, data.description_ne, data.thumbnail, data.category ?? "Video", data.duration ?? "", data.status, data.author_id]
  );
  return rows[0];
}

export async function updateVideo(id: string, data: Partial<Omit<Video, "id" | "author_id" | "created_at" | "updated_at">>): Promise<Video | null> {
  const { rows } = await pool.query(
    `UPDATE videos SET
       title_en=COALESCE($2,title_en), title_ne=COALESCE($3,title_ne),
       youtube_url=COALESCE($4,youtube_url), description_en=COALESCE($5,description_en),
       description_ne=COALESCE($6,description_ne), thumbnail=COALESCE($7,thumbnail),
       category=COALESCE($8,category), duration=COALESCE($9,duration),
       status=COALESCE($10,status), updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id, data.title_en, data.title_ne, data.youtube_url, data.description_en, data.description_ne, data.thumbnail, data.category, data.duration, data.status]
  );
  return rows[0] ?? null;
}

export async function deleteVideo(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM videos WHERE id=$1", [id]);
  return (rowCount ?? 0) > 0;
}

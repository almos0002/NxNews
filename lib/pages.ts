import { pool } from "./db";

export interface Page {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  content_en: string;
  content_ne: string;
  status: "draft" | "published" | "archived";
  author_id: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export async function listPages(opts?: { limit?: number; offset?: number }): Promise<Page[]> {
  const limit = opts?.limit ?? 1000;
  const offset = opts?.offset ?? 0;
  const { rows } = await pool.query(
    "SELECT * FROM pages ORDER BY updated_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return rows;
}

export async function countPages(): Promise<number> {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS cnt FROM pages");
  return rows[0]?.cnt ?? 0;
}

export async function getPageById(id: string): Promise<Page | null> {
  const { rows } = await pool.query("SELECT * FROM pages WHERE id=$1", [id]);
  return rows[0] ?? null;
}

export async function createPage(
  data: Omit<Page, "id" | "created_at" | "updated_at">
): Promise<Page> {
  const { rows } = await pool.query(
    `INSERT INTO pages (title_en,title_ne,slug,content_en,content_ne,status,author_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.title_en, data.title_ne, data.slug, data.content_en, data.content_ne, data.status, data.author_id]
  );
  return rows[0];
}

export async function updatePage(
  id: string,
  data: Partial<Omit<Page, "id" | "author_id" | "created_at" | "updated_at">>
): Promise<Page | null> {
  const { rows } = await pool.query(
    `UPDATE pages SET
       title_en=COALESCE($2,title_en), title_ne=COALESCE($3,title_ne),
       slug=COALESCE($4,slug), content_en=COALESCE($5,content_en),
       content_ne=COALESCE($6,content_ne), status=COALESCE($7,status),
       updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id, data.title_en, data.title_ne, data.slug, data.content_en, data.content_ne, data.status]
  );
  return rows[0] ?? null;
}

export async function deletePage(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM pages WHERE id=$1", [id]);
  return (rowCount ?? 0) > 0;
}

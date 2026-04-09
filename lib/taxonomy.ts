import { pool } from "./db";

export interface Category {
  id: string;
  name_en: string;
  name_ne: string;
  slug: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name_en: string;
  name_ne: string;
  slug: string;
  created_at: string;
}

export async function listCategories(): Promise<Category[]> {
  const { rows } = await pool.query(
    "SELECT id,name_en,name_ne,slug,created_at FROM categories ORDER BY name_en"
  );
  return rows;
}

export async function createCategory(data: Omit<Category, "id" | "created_at">): Promise<Category> {
  const { rows } = await pool.query(
    "INSERT INTO categories (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING id,name_en,name_ne,slug,created_at",
    [data.name_en, data.name_ne, data.slug]
  );
  return rows[0];
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id" | "created_at">>): Promise<Category | null> {
  const { rows } = await pool.query(
    `UPDATE categories SET
       name_en=COALESCE($2,name_en), name_ne=COALESCE($3,name_ne),
       slug=COALESCE($4,slug)
     WHERE id=$1 RETURNING id,name_en,name_ne,slug,created_at`,
    [id, data.name_en, data.name_ne, data.slug]
  );
  return rows[0] ?? null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  return (rowCount ?? 0) > 0;
}

export async function listTags(): Promise<Tag[]> {
  const { rows } = await pool.query("SELECT * FROM tags ORDER BY name_en");
  return rows;
}

export async function createTag(data: Omit<Tag, "id" | "created_at">): Promise<Tag> {
  const { rows } = await pool.query(
    "INSERT INTO tags (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING *",
    [data.name_en, data.name_ne, data.slug]
  );
  return rows[0];
}

export async function updateTag(id: string, data: Partial<Omit<Tag, "id" | "created_at">>): Promise<Tag | null> {
  const { rows } = await pool.query(
    `UPDATE tags SET name_en=COALESCE($2,name_en), name_ne=COALESCE($3,name_ne), slug=COALESCE($4,slug) WHERE id=$1 RETURNING *`,
    [id, data.name_en, data.name_ne, data.slug]
  );
  return rows[0] ?? null;
}

export async function deleteTag(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM tags WHERE id=$1", [id]);
  return (rowCount ?? 0) > 0;
}

import { unstable_cache, revalidateTag } from "next/cache";
import { pool } from "../db/db";

const CATEGORIES_TAG = "categories";
const TAGS_TAG = "tags";

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

// Categories & tags are read on essentially every page and change rarely.
// Cache for 5 minutes; writes below invalidate via revalidateTag.
export const listCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { rows } = await pool.query(
      "SELECT id,name_en,name_ne,slug,created_at FROM categories ORDER BY name_en"
    );
    return rows;
  },
  ["categories:all"],
  { tags: [CATEGORIES_TAG], revalidate: 300 },
);

export async function createCategory(data: Omit<Category, "id" | "created_at">): Promise<Category> {
  const { rows } = await pool.query(
    "INSERT INTO categories (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING id,name_en,name_ne,slug,created_at",
    [data.name_en, data.name_ne, data.slug]
  );
  revalidateTag(CATEGORIES_TAG, "default");
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
  revalidateTag(CATEGORIES_TAG, "default");
  return rows[0] ?? null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  revalidateTag(CATEGORIES_TAG, "default");
  return (rowCount ?? 0) > 0;
}

export const listTags = unstable_cache(
  async (): Promise<Tag[]> => {
    const { rows } = await pool.query(
      "SELECT id,name_en,name_ne,slug,created_at FROM tags ORDER BY name_en"
    );
    return rows;
  },
  ["tags:all"],
  { tags: [TAGS_TAG], revalidate: 300 },
);

export async function createTag(data: Omit<Tag, "id" | "created_at">): Promise<Tag> {
  const { rows } = await pool.query(
    "INSERT INTO tags (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING id,name_en,name_ne,slug,created_at",
    [data.name_en, data.name_ne, data.slug]
  );
  revalidateTag(TAGS_TAG, "default");
  return rows[0];
}

export async function updateTag(id: string, data: Partial<Omit<Tag, "id" | "created_at">>): Promise<Tag | null> {
  const { rows } = await pool.query(
    `UPDATE tags SET name_en=COALESCE($2,name_en), name_ne=COALESCE($3,name_ne), slug=COALESCE($4,slug) WHERE id=$1 RETURNING id,name_en,name_ne,slug,created_at`,
    [id, data.name_en, data.name_ne, data.slug]
  );
  revalidateTag(TAGS_TAG, "default");
  return rows[0] ?? null;
}

export async function deleteTag(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM tags WHERE id=$1", [id]);
  revalidateTag(TAGS_TAG, "default");
  return (rowCount ?? 0) > 0;
}

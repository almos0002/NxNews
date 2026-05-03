import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { pool } from "../db/db";

const CATEGORIES_TAG = "categories";
const TAGS_TAG = "tags";

// Immediate expiration so taxonomy reads reflect admin writes on the next request.
const TAXONOMY_REVALIDATE_PROFILE = { expire: 0 } as const;

const LOCALES = ["en", "ne"] as const;

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

// Cached; invalidated explicitly via `revalidateTag` on writes below.
export const listCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { rows } = await pool.query(
      "SELECT id,name_en,name_ne,slug,created_at FROM categories ORDER BY name_en"
    );
    return rows;
  },
  ["categories:all"],
  { tags: [CATEGORIES_TAG] },
);

function revalidateCategoryPaths(slugs: string[] = []) {
  revalidateTag(CATEGORIES_TAG, TAXONOMY_REVALIDATE_PROFILE);
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/latest`);
    revalidatePath(`/${locale}/dashboard/taxonomy`);
    revalidatePath(`/${locale}/dashboard/articles/new`);
    revalidatePath(`/${locale}/dashboard/articles`, "layout");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/${locale}/${slug}`);
    }
  }
}

function revalidateTagPaths(slugs: string[] = []) {
  revalidateTag(TAGS_TAG, TAXONOMY_REVALIDATE_PROFILE);
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/latest`);
    revalidatePath(`/${locale}/search`);
    revalidatePath(`/${locale}/dashboard/taxonomy`);
    revalidatePath(`/${locale}/tags`, "layout");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/${locale}/tags/${slug}`);
    }
  }
}

async function getCategoryById(id: string): Promise<Category | null> {
  const { rows } = await pool.query(
    "SELECT id,name_en,name_ne,slug,created_at FROM categories WHERE id=$1",
    [id],
  );
  return rows[0] ?? null;
}

async function getTagById(id: string): Promise<Tag | null> {
  const { rows } = await pool.query(
    "SELECT id,name_en,name_ne,slug,created_at FROM tags WHERE id=$1",
    [id],
  );
  return rows[0] ?? null;
}

export async function createCategory(data: Omit<Category, "id" | "created_at">): Promise<Category> {
  const { rows } = await pool.query(
    "INSERT INTO categories (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING id,name_en,name_ne,slug,created_at",
    [data.name_en, data.name_ne, data.slug]
  );
  revalidateCategoryPaths([rows[0].slug]);
  return rows[0];
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id" | "created_at">>): Promise<Category | null> {
  const prev = await getCategoryById(id);
  if (!prev) return null;

  const { rows } = await pool.query(
    `UPDATE categories SET
       name_en=COALESCE($2,name_en), name_ne=COALESCE($3,name_ne),
       slug=COALESCE($4,slug)
     WHERE id=$1 RETURNING id,name_en,name_ne,slug,created_at`,
    [id, data.name_en, data.name_ne, data.slug]
  );
  const next: Category | null = rows[0] ?? null;
  if (!next) return null;

  // Cascade renames into existing article.category strings.
  const oldValues = Array.from(new Set(
    [prev.slug, prev.name_en, prev.name_ne].filter(Boolean),
  )).filter((v) => v !== next.slug);
  let affectedSlugs: string[] = [];
  if (oldValues.length) {
    const { rows: affected } = await pool.query(
      `UPDATE article SET category = $1, updated_at = NOW()
       WHERE LOWER(category) = ANY($2::text[])
       RETURNING slug`,
      [next.slug, oldValues.map((v) => v.toLowerCase())],
    );
    affectedSlugs = affected.map((r: { slug: string }) => r.slug);
  }

  revalidateCategoryPaths([prev.slug, next.slug]);
  for (const locale of LOCALES) {
    for (const slug of affectedSlugs) {
      revalidatePath(`/${locale}/article/${slug}`);
    }
  }
  return next;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const prev = await getCategoryById(id);
  let affectedSlugs: string[] = [];
  if (prev) {
    const aliases = Array.from(new Set(
      [prev.slug, prev.name_en, prev.name_ne].filter(Boolean),
    )).map((v) => v.toLowerCase());
    const { rows } = await pool.query(
      `SELECT slug FROM article WHERE LOWER(category) = ANY($1::text[])`,
      [aliases],
    );
    affectedSlugs = rows.map((r: { slug: string }) => r.slug);
  }
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  revalidateCategoryPaths(prev ? [prev.slug] : []);
  for (const locale of LOCALES) {
    for (const slug of affectedSlugs) {
      revalidatePath(`/${locale}/article/${slug}`);
    }
  }
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
  { tags: [TAGS_TAG] },
);

export async function createTag(data: Omit<Tag, "id" | "created_at">): Promise<Tag> {
  const { rows } = await pool.query(
    "INSERT INTO tags (name_en,name_ne,slug) VALUES ($1,$2,$3) RETURNING id,name_en,name_ne,slug,created_at",
    [data.name_en, data.name_ne, data.slug]
  );
  revalidateTagPaths([rows[0].slug]);
  return rows[0];
}

export async function updateTag(id: string, data: Partial<Omit<Tag, "id" | "created_at">>): Promise<Tag | null> {
  const prev = await getTagById(id);
  if (!prev) return null;

  const { rows } = await pool.query(
    `UPDATE tags SET name_en=COALESCE($2,name_en), name_ne=COALESCE($3,name_ne), slug=COALESCE($4,slug) WHERE id=$1 RETURNING id,name_en,name_ne,slug,created_at`,
    [id, data.name_en, data.name_ne, data.slug]
  );
  const next: Tag | null = rows[0] ?? null;
  if (!next) return null;

  // Cascade renames into the article.tags text[] (case-insensitive).
  const oldValues = Array.from(new Set(
    [prev.slug, prev.name_en, prev.name_ne].filter(Boolean),
  )).filter((v) => v !== next.slug);
  const affectedSlugSet = new Set<string>();
  for (const old of oldValues) {
    const { rows: affected } = await pool.query(
      `UPDATE article
         SET tags = ARRAY(
               SELECT CASE WHEN LOWER(t) = LOWER($1) THEN $2 ELSE t END
                 FROM unnest(tags) AS t
             ),
             updated_at = NOW()
       WHERE EXISTS (
         SELECT 1 FROM unnest(tags) AS t WHERE LOWER(t) = LOWER($1)
       )
       RETURNING slug`,
      [old, next.slug],
    );
    for (const r of affected) affectedSlugSet.add((r as { slug: string }).slug);
  }

  revalidateTagPaths([prev.slug, next.slug]);
  for (const locale of LOCALES) {
    for (const slug of affectedSlugSet) {
      revalidatePath(`/${locale}/article/${slug}`);
    }
  }
  return next;
}

export async function deleteTag(id: string): Promise<boolean> {
  const prev = await getTagById(id);
  let affectedSlugs: string[] = [];
  if (prev) {
    const aliases = Array.from(new Set(
      [prev.slug, prev.name_en, prev.name_ne].filter(Boolean),
    )).map((v) => v.toLowerCase());
    const { rows } = await pool.query(
      `SELECT slug FROM article
       WHERE EXISTS (
         SELECT 1 FROM unnest(tags) AS t WHERE LOWER(t) = ANY($1::text[])
       )`,
      [aliases],
    );
    affectedSlugs = rows.map((r: { slug: string }) => r.slug);
  }
  const { rowCount } = await pool.query("DELETE FROM tags WHERE id=$1", [id]);
  revalidateTagPaths(prev ? [prev.slug] : []);
  for (const locale of LOCALES) {
    for (const slug of affectedSlugs) {
      revalidatePath(`/${locale}/article/${slug}`);
    }
  }
  return (rowCount ?? 0) > 0;
}

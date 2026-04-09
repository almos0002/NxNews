import { pool } from "./db";

export interface Article {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  excerpt_en: string;
  excerpt_ne: string;
  content_en: string;
  content_ne: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured_image: string;
  author_id: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ArticleWithAuthor extends Article {
  author_name: string | null;
}

export async function listArticles(opts?: {
  status?: string;
  authorId?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ArticleWithAuthor[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (opts?.status && opts.status !== "all") {
    conditions.push(`a.status = $${idx++}`);
    values.push(opts.status);
  }
  if (opts?.authorId) {
    conditions.push(`a.author_id = $${idx++}`);
    values.push(opts.authorId);
  }
  if (opts?.category) {
    conditions.push(`a.category = $${idx++}`);
    values.push(opts.category);
  }
  if (opts?.search) {
    conditions.push(`(a.title_en ILIKE $${idx} OR a.title_ne ILIKE $${idx})`);
    values.push(`%${opts.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;

  const { rows } = await pool.query<ArticleWithAuthor>(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );
  return rows;
}

export async function getArticleById(id: string): Promise<ArticleWithAuthor | null> {
  const { rows } = await pool.query<ArticleWithAuthor>(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export interface ArticleInput {
  title_en: string;
  title_ne: string;
  slug: string;
  excerpt_en: string;
  excerpt_ne: string;
  content_en: string;
  content_ne: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured_image: string;
  author_id: string;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const publishedAt = input.status === "published" ? new Date() : null;
  const { rows } = await pool.query<Article>(
    `INSERT INTO article
       (title_en, title_ne, slug, excerpt_en, excerpt_ne,
        content_en, content_ne, category, tags, status,
        featured_image, author_id, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      input.title_en, input.title_ne, input.slug,
      input.excerpt_en, input.excerpt_ne,
      input.content_en, input.content_ne,
      input.category, input.tags, input.status,
      input.featured_image, input.author_id, publishedAt,
    ]
  );
  return rows[0];
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<Article | null> {
  const fields = [
    "title_en", "title_ne", "slug", "excerpt_en", "excerpt_ne",
    "content_en", "content_ne", "category", "tags", "status", "featured_image",
  ] as const;

  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const f of fields) {
    if (input[f] !== undefined) {
      sets.push(`${f} = $${idx++}`);
      values.push(input[f]);
    }
  }
  if (input.status === "published") {
    sets.push(`published_at = COALESCE(published_at, NOW())`);
  }
  sets.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<Article>(
    `UPDATE article SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { rowCount } = await pool.query(`DELETE FROM article WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function countByStatus(authorId?: string): Promise<Record<string, number>> {
  const { rows } = await pool.query<{ status: string; cnt: string }>(
    `SELECT status, COUNT(*) AS cnt FROM article
     ${authorId ? 'WHERE author_id = $1' : ''}
     GROUP BY status`,
    authorId ? [authorId] : []
  );
  const counts: Record<string, number> = { all: 0, draft: 0, published: 0, archived: 0 };
  for (const r of rows) {
    counts[r.status] = parseInt(r.cnt, 10);
    counts.all += parseInt(r.cnt, 10);
  }
  return counts;
}

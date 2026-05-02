import { pool } from "@/lib/db/db";

export interface BookmarkedArticle {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  category: string;
  featured_image: string | null;
  excerpt_en: string | null;
  author_name: string | null;
  published_at: string | null;
  bookmarked_at: string;
}

export interface ReadHistoryArticle {
  id: string;
  title_en: string;
  title_ne: string;
  slug: string;
  category: string;
  featured_image: string | null;
  author_name: string | null;
  published_at: string | null;
  read_at: string;
}

export async function getBookmarks(userId: string): Promise<BookmarkedArticle[]> {
  const res = await pool.query<BookmarkedArticle>(
    `SELECT a.id, a.title_en, a.title_ne, a.slug, a.category,
            a.featured_image, a.excerpt_en, a.published_at,
            u.name AS author_name,
            b.created_at AS bookmarked_at
     FROM bookmarks b
     JOIN article a ON a.id = b.article_id
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE b.user_id = $1 AND a.status = 'published'
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return res.rows;
}

export async function getReadingHistory(userId: string, limit = 20): Promise<ReadHistoryArticle[]> {
  const res = await pool.query<ReadHistoryArticle>(
    `SELECT a.id, a.title_en, a.title_ne, a.slug, a.category,
            a.featured_image, a.published_at,
            u.name AS author_name,
            rh.read_at
     FROM reading_history rh
     JOIN article a ON a.id = rh.article_id
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE rh.user_id = $1 AND a.status = 'published'
     ORDER BY rh.read_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
}

export async function isBookmarked(userId: string, articleId: string): Promise<boolean> {
  const res = await pool.query(
    "SELECT 1 FROM bookmarks WHERE user_id = $1 AND article_id = $2",
    [userId, articleId]
  );
  return (res.rowCount ?? 0) > 0;
}

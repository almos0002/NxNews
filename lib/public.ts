import { pool } from "./db";

function sanitizeImageUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.pathname.startsWith("/_next/image")) {
      const original = u.searchParams.get("url");
      if (original) return decodeURIComponent(original);
    }
  } catch { /* not a URL */ }
  return raw;
}

export interface PublicArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  time?: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  viewCount?: number;
  rawId?: string;
}

export interface PublicVideo {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  duration: string;
  thumbnailUrl: string;
}

function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function mapArticle(row: Record<string, unknown>, locale: string): PublicArticle {
  const isNe = locale === "ne";
  const title = (isNe && row.title_ne) ? String(row.title_ne) : String(row.title_en ?? "");
  const excerpt = (isNe && row.excerpt_ne) ? String(row.excerpt_ne) : String(row.excerpt_en ?? "");
  const content = (isNe && row.content_ne) ? String(row.content_ne) : String(row.content_en ?? "");
  return {
    id: String(row.slug ?? row.id),
    rawId: String(row.id),
    title,
    excerpt,
    category: String(row.category ?? ""),
    author: String(row.author_name ?? "KumariHub"),
    date: formatDate(row.created_at as string),
    time: formatTime(row.created_at as string),
    readTime: estimateReadTime(content),
    imageUrl: sanitizeImageUrl(String(row.featured_image ?? "")),
    viewCount: typeof row.view_count === "number" ? row.view_count : parseInt(String(row.view_count ?? "0"), 10),
  };
}

function mapVideo(row: Record<string, unknown>, locale: string): PublicVideo {
  const isNe = locale === "ne";
  return {
    id: String(row.id),
    title: (isNe && row.title_ne) ? String(row.title_ne) : String(row.title_en ?? ""),
    excerpt: (isNe && row.description_ne) ? String(row.description_ne) : String(row.description_en ?? ""),
    category: String(row.category ?? "Video"),
    author: String(row.author_name ?? "KumariHub"),
    date: formatDate(row.created_at as string),
    duration: String(row.duration ?? ""),
    thumbnailUrl: String(row.thumbnail ?? ""),
  };
}

export async function getPublicArticles(
  locale: string,
  opts?: { limit?: number; offset?: number; category?: string }
): Promise<PublicArticle[]> {
  const conditions = ["a.status = 'published'"];
  const values: unknown[] = [];
  let idx = 1;

  if (opts?.category) {
    conditions.push(`LOWER(a.category) = $${idx++}`);
    values.push(opts.category.toLowerCase());
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const limit = opts?.limit ?? 30;
  const offset = opts?.offset ?? 0;

  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     ${where}
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function getPublicArticleBySlug(
  slug: string,
  locale: string
): Promise<(PublicArticle & { content: string; tags: string[] }) | null> {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.slug = $1 AND a.status = 'published'`,
    [slug]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  const base = mapArticle(row, locale);
  const isNe = locale === "ne";
  const content = (isNe && row.content_ne) ? String(row.content_ne) : String(row.content_en ?? "");
  return {
    ...base,
    content,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export async function getRelatedPublicArticles(
  slug: string,
  category: string,
  locale: string,
  limit = 4
): Promise<PublicArticle[]> {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published' AND a.slug != $1
       AND LOWER(a.category) = LOWER($2)
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
     LIMIT $3`,
    [slug, category, limit]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function getPublicArticlesByTag(
  tag: string,
  locale: string
): Promise<PublicArticle[]> {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published' AND $1 = ANY(a.tags)
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC`,
    [tag]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function getPublicArticlesByAuthorName(
  authorName: string,
  locale: string
): Promise<PublicArticle[]> {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published' AND LOWER(u.name) = LOWER($1)
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC`,
    [authorName]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function searchPublicArticles(
  query: string,
  locale: string
): Promise<PublicArticle[]> {
  if (!query.trim()) return [];
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published'
       AND (a.title_en ILIKE $1 OR a.title_ne ILIKE $1
            OR a.excerpt_en ILIKE $1 OR a.excerpt_ne ILIKE $1
            OR LOWER(a.category) ILIKE $1
            OR u.name ILIKE $1)
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
     LIMIT 50`,
    [`%${query}%`]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function getTrendingArticles(
  locale: string,
  limit = 8
): Promise<PublicArticle[]> {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published'
     ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => mapArticle(r, locale));
}

export async function getBreakingHeadline(locale: string): Promise<string> {
  try {
    const key = locale === "ne" ? "breaking_news_text_ne" : "breaking_news_text_en";
    const { rows } = await pool.query(
      `SELECT value FROM settings WHERE key = $1 LIMIT 1`,
      [key]
    );
    if (rows[0]?.value) return String(rows[0].value);
  } catch {}

  try {
    const { rows } = await pool.query(
      `SELECT title_en, title_ne FROM article
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 1`
    );
    if (rows[0]) {
      return locale === "ne" && rows[0].title_ne
        ? String(rows[0].title_ne)
        : String(rows[0].title_en);
    }
  } catch {}

  return locale === "ne"
    ? "वैश्विक जलवायु शिखर सम्मेलनले कार्बन उत्सर्जनमा ऐतिहासिक सम्झौतामा पुग्यो"
    : "Global Climate Summit Reaches Historic Agreement on Carbon Emissions";
}

export async function getBreakingHeadlines(
  locale: string,
  limit = 10
): Promise<{ title: string; slug: string }[]> {
  try {
    const { rows } = await pool.query(
      `SELECT title_en, title_ne, slug FROM article
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $1`,
      [limit]
    );
    return rows.map((r) => ({
      title:
        locale === "ne" && r.title_ne
          ? String(r.title_ne)
          : String(r.title_en),
      slug: String(r.slug),
    }));
  } catch {
    return [];
  }
}

export async function getPublicTags(): Promise<
  { slug: string; label: string; description: string }[]
> {
  const { rows } = await pool.query(
    `SELECT slug, name_en AS label, '' AS description FROM tags ORDER BY name_en`
  );
  return rows;
}

export async function getPublicVideos(locale: string): Promise<PublicVideo[]> {
  const { rows } = await pool.query(
    `SELECT v.*, u.name AS author_name
     FROM videos v
     LEFT JOIN "user" u ON u.id = v.author_id
     WHERE v.status = 'published'
     ORDER BY v.created_at DESC`
  );
  return rows.map((r) => mapVideo(r, locale));
}

export async function getPublicVideoById(
  id: string,
  locale: string
): Promise<PublicVideo | null> {
  const { rows } = await pool.query(
    `SELECT v.*, u.name AS author_name
     FROM videos v
     LEFT JOIN "user" u ON u.id = v.author_id
     WHERE v.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return mapVideo(rows[0], locale);
}

export async function getAuthorInfo(
  authorName: string
): Promise<{ id: string; name: string; role: string; bio: string; twitter?: string; linkedin?: string } | null> {
  const { rows } = await pool.query(
    `SELECT id, name, bio FROM "user" WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [authorName]
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    role: "Contributor",
    bio: rows[0].bio || `${rows[0].name} is a contributor to KumariHub.`,
  };
}

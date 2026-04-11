import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import FeaturedClient from "./FeaturedClient";

export const metadata: Metadata = { title: "Featured Posts — KumariHub" };

async function getFeaturedArticles() {
  const res = await pool.query<{
    id: string; title_en: string; title_ne: string; slug: string;
    category: string; status: string; view_count: number;
    author_name: string | null; updated_at: string;
  }>(
    `SELECT a.id, a.title_en, a.title_ne, a.slug, a.category, a.status,
            a.view_count, a.updated_at,
            u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.is_featured = true AND a.status = 'published'
     ORDER BY a.updated_at DESC`
  );
  return res.rows;
}

async function getAllPublishedArticles() {
  const res = await pool.query<{
    id: string; title_en: string; title_ne: string; slug: string;
    category: string; is_featured: boolean; author_name: string | null;
  }>(
    `SELECT a.id, a.title_en, a.title_ne, a.slug, a.category,
            COALESCE(a.is_featured, false) AS is_featured,
            u.name AS author_name
     FROM article a
     LEFT JOIN "user" u ON u.id = a.author_id
     WHERE a.status = 'published'
     ORDER BY a.published_at DESC
     LIMIT 200`
  );
  return res.rows;
}

export default async function FeaturedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const [featured, allArticles] = await Promise.all([
    getFeaturedArticles(),
    getAllPublishedArticles(),
  ]);

  return <FeaturedClient initialFeatured={featured} allArticles={allArticles} />;
}

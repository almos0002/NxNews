import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArticleById } from "@/lib/articles";
import { listCategories } from "@/lib/taxonomy";
import ArticleEditor from "@/app/_components/ArticleEditor";

export const metadata: Metadata = { title: "Edit Article — KumariHub Dashboard" };

type Ctx = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles");

  const role = (session.user as { role?: string }).role ?? "user";
  const { id } = await params;
  const [article, dbCategories] = await Promise.all([
    getArticleById(id),
    listCategories().catch(() => []),
  ]);
  if (!article) notFound();

  if (role === "author" && article.author_id !== session.user.id) notFound();

  const categories = dbCategories.map((c) => ({ value: c.slug, label: c.name_en }));

  return (
    <ArticleEditor
      authorId={session.user.id}
      backHref="/en/dashboard/articles"
      categories={categories}
      initial={{
        id: article.id,
        title_en: article.title_en,
        title_ne: article.title_ne,
        slug: article.slug,
        excerpt_en: article.excerpt_en,
        excerpt_ne: article.excerpt_ne,
        content_en: article.content_en,
        content_ne: article.content_ne,
        category: article.category,
        tags: article.tags,
        status: article.status,
        featured_image: article.featured_image,
      }}
    />
  );
}

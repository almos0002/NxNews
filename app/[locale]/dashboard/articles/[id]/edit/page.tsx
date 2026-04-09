import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArticleById } from "@/lib/articles";
import ArticleEditor from "@/app/_components/ArticleEditor";

export const metadata: Metadata = { title: "Edit Article — KumariHub Dashboard" };

type Ctx = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Ctx) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles");

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <ArticleEditor
      authorId={session.user.id}
      backHref="/en/dashboard/articles"
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

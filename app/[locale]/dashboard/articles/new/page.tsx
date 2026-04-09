import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCategories } from "@/lib/taxonomy";
import ArticleEditor from "@/app/_components/ArticleEditor";

export const metadata: Metadata = { title: "New Article — KumariHub Dashboard" };

export default async function NewArticlePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles/new");

  const dbCategories = await listCategories().catch(() => []);
  const categories = dbCategories.map((c) => ({ value: c.slug, label: c.name_en }));

  return (
    <ArticleEditor
      authorId={session.user.id}
      backHref="/en/dashboard/articles"
      categories={categories}
    />
  );
}

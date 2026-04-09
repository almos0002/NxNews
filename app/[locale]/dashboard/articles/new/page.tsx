import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ArticleEditor from "@/app/_components/ArticleEditor";

export const metadata: Metadata = { title: "New Article — KumariHub Dashboard" };

export default async function NewArticlePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles/new");

  return (
    <ArticleEditor
      authorId={session.user.id}
      backHref="/en/dashboard/articles"
    />
  );
}

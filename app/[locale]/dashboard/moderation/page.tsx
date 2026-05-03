import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { listArticles, countByStatus } from "@/lib/content/articles";
import ModerationClient from "@/app/_components/dashboard/ModerationClient";
import PaginationBar from "@/app/_components/article/PaginationBar";

export const metadata: Metadata = { title: "Review Queue" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string>>;

export default async function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/moderation");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const [articles, counts] = await Promise.all([
    listArticles({ status: "review", limit: PER_PAGE, offset }),
    countByStatus(),
  ]);

  const total = counts.review ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ModerationClient initialArticles={articles as any} />
      <PaginationBar page={page} totalPages={totalPages} />
    </>
  );
}

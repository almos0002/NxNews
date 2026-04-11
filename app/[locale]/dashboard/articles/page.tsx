import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listArticles, countByStatus } from "@/lib/articles";
import Link from "next/link";
import ArticleListClient from "@/app/_components/ArticleListClient";
import PaginationBar from "@/app/_components/PaginationBar";
import styles from "./articles.module.css";

export const metadata: Metadata = { title: "Articles — KumariHub Dashboard" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string>>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles");

  const role = (session.user as { role?: string }).role ?? "user";
  const isAuthor = role === "author";
  const authorId = isAuthor ? session.user.id : undefined;

  const sp = await searchParams;
  const status = sp.status ?? "all";
  const search = sp.search ?? undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const [articles, counts] = await Promise.all([
    listArticles({ status, search, authorId, limit: PER_PAGE, offset }),
    countByStatus(authorId),
  ]);

  const totalForStatus = status === "all"
    ? counts.all
    : (counts[status] ?? 0);
  const totalPages = Math.ceil(totalForStatus / PER_PAGE);

  const pageParams: Record<string, string> = { status };
  if (search) pageParams.search = search;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>
            ← Dashboard
          </Link>
          <h1 className={styles.pageTitle}>Articles</h1>
        </div>
        <Link href="/en/dashboard/articles/new" className={styles.newBtn}>
          + New Article
        </Link>
      </div>

      <ArticleListClient
        initialArticles={articles}
        counts={counts}
        currentStatus={status}
        currentSearch={search ?? ""}
      />

      <PaginationBar page={page} totalPages={totalPages} params={pageParams} />
    </div>
  );
}

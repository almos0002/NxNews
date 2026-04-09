import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listArticles, countByStatus } from "@/lib/articles";
import Link from "next/link";
import ArticleListClient from "@/app/_components/ArticleListClient";
import styles from "./articles.module.css";

export const metadata: Metadata = { title: "Articles — KumariHub Dashboard" };

type SearchParams = Promise<Record<string, string>>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/articles");

  const sp = await searchParams;
  const status = sp.status ?? "all";
  const search = sp.search ?? undefined;

  const [articles, counts] = await Promise.all([
    listArticles({ status, search }),
    countByStatus(),
  ]);

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
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPages, countPages } from "@/lib/pages";
import Link from "next/link";
import PagesClient from "@/app/_components/PagesClient";
import PaginationBar from "@/app/_components/PaginationBar";
import styles from "@/app/_components/cms.module.css";

export const metadata: Metadata = { title: "Pages — KumariHub Dashboard" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string>>;

export default async function PagesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/pages");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const [pages, total] = await Promise.all([
    listPages({ limit: PER_PAGE, offset }),
    countPages(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>Pages</h1>
        </div>
        <Link href="/en/dashboard/pages/new" className={styles.newBtn}>
          + New Page
        </Link>
      </div>

      <PagesClient initialPages={pages} />
      <PaginationBar page={page} totalPages={totalPages} />
    </div>
  );
}

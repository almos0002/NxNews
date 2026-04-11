import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPages } from "@/lib/pages";
import Link from "next/link";
import PagesClient from "@/app/_components/PagesClient";
import styles from "@/app/_components/cms.module.css";

export const metadata: Metadata = { title: "Pages — KumariHub Dashboard" };

export default async function PagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/pages");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const pages = await listPages();

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
    </div>
  );
}

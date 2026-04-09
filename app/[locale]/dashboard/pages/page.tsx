import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPages } from "@/lib/pages";
import Link from "next/link";
import styles from "@/app/_components/cms.module.css";

export const metadata: Metadata = { title: "Pages — KumariHub Dashboard" };

export default async function PagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/pages");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const pages = await listPages();

  function statusClass(s: string) {
    if (s === "published") return styles.badgePublished;
    if (s === "archived") return styles.badgeArchived;
    return styles.badgeDraft;
  }

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

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  No pages yet. <Link href="/en/dashboard/pages/new">Create your first page</Link>.
                </td>
              </tr>
            ) : pages.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.title_en}</strong>{p.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{p.title_ne}</span></>}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>/{p.slug}</td>
                <td><span className={`${styles.badge} ${statusClass(p.status)}`}>{p.status}</span></td>
                <td style={{ color: "var(--color-ink-muted)", fontSize: "0.82rem" }}>
                  {new Date(p.updated_at).toLocaleDateString("en-GB")}
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <Link href={`/en/dashboard/pages/${p.id}/edit`} className={styles.editBtn}>Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

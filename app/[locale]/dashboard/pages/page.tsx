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
              <th>Views</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No pages yet. <Link href="/en/dashboard/pages/new">Create your first page</Link>.
                </td>
              </tr>
            ) : pages.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.title_en}</strong>{p.title_ne && <><br /><span style={{ color: "var(--color-ink-muted)", fontSize: "0.8rem" }}>{p.title_ne}</span></>}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>/{p.slug}</td>
                <td><span className={`${styles.badge} ${statusClass(p.status)}`}>{p.status}</span></td>
                <td className={styles.viewsCell}>
                  {p.view_count != null && p.view_count > 0 ? (
                    <span className={styles.viewsValue}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {(p.view_count ?? 0) >= 1000 ? `${((p.view_count ?? 0) / 1000).toFixed(1)}k` : (p.view_count ?? 0).toLocaleString()}
                    </span>
                  ) : <span className={styles.none}>—</span>}
                </td>
                <td className={styles.dateCell}>
                  {new Date(p.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <Link href={`/en/dashboard/pages/${p.id}/edit`} className={styles.editBtn} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </Link>
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

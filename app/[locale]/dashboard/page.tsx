import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard — KumariHub" };

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderator",
  author: "Author",
  user: "Reader",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#7c3aed",
  moderator: "#0891b2",
  author: "#059669",
  user: "#64748b",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login");

  const { user } = session;
  const role = (user as { role?: string }).role ?? "user";
  const isAdmin = role === "admin";
  const isModerator = role === "admin" || role === "moderator";
  const isAuthor = role === "admin" || role === "moderator" || role === "author";

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageGreeting}>Welcome back,</p>
          <h1 className={styles.pageTitle}>{user.name}</h1>
        </div>
        <span
          className={styles.roleBadge}
          style={{ background: ROLE_COLORS[role] ?? "#64748b" }}
        >
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {isAdmin && <>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Users</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>Registered accounts</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Published Articles</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>Live on site</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Pending Review</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>Awaiting approval</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Page Views</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>Last 30 days</p>
          </div>
        </>}
        {!isAdmin && isAuthor && <>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>My Articles</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>All time</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Published</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>Live on site</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Drafts</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>In progress</p>
          </div>
        </>}
        {!isAuthor && <>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Saved Articles</p>
            <p className={styles.statValue}>—</p>
            <p className={styles.statSub}>In your reading list</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Newsletter</p>
            <p className={styles.statValue}>Active</p>
            <p className={styles.statSub}>Daily Briefing</p>
          </div>
        </>}
      </div>

      {/* Profile card */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>My Profile</h2>
        <div className={styles.profileCard}>
          <div className={styles.profileCardRow}>
            <div className={styles.profileCardField}>
              <label className={styles.fieldLabel}>Full name</label>
              <p className={styles.fieldValue}>{user.name}</p>
            </div>
            <div className={styles.profileCardField}>
              <label className={styles.fieldLabel}>Email</label>
              <p className={styles.fieldValue}>{user.email}</p>
            </div>
            <div className={styles.profileCardField}>
              <label className={styles.fieldLabel}>Role</label>
              <p className={styles.fieldValue}>
                <span
                  className={styles.roleBadge}
                  style={{ background: ROLE_COLORS[role] ?? "#64748b" }}
                >
                  {ROLE_LABELS[role] ?? role}
                </span>
              </p>
            </div>
            <div className={styles.profileCardField}>
              <label className={styles.fieldLabel}>Member since</label>
              <p className={styles.fieldValue}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Author: Articles quick link */}
      {isAuthor && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Articles</h2>
            <a href="/en/dashboard/articles/new" className={styles.actionBtn}>
              + New Article
            </a>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Status</th>
                  <th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    No articles yet.{" "}
                    <a href="/en/dashboard/articles/new">Click here</a> to write your first article.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Moderator: Queue */}
      {isModerator && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Moderation Queue</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article</th><th>Author</th>
                  <th>Submitted</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No items pending review.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Admin: User management */}
      {isAdmin && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>User Management</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={styles.roleBadge}
                      style={{ background: ROLE_COLORS[role] ?? "#64748b" }}
                    >
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td>
                    <select className={styles.roleSelect} defaultValue={role}>
                      <option value="user">Reader</option>
                      <option value="author">Author</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { countByStatus, listArticles } from "@/lib/articles";
import styles from "./dashboard.module.css";
import RecentViewsWidget from "@/app/_components/RecentViewsWidget";

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

const STATUS_COLORS: Record<string, string> = {
  published: "#059669",
  draft: "#64748b",
  review: "#d97706",
  archived: "#94a3b8",
};

async function getAdminStats() {
  const [usersRes, articlesRes, pendingRes, viewsRes] = await Promise.all([
    pool.query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM \"user\""),
    pool.query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM article WHERE status = 'published'"),
    pool.query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM article WHERE status = 'review'"),
    pool.query<{ cnt: string }>("SELECT COUNT(*) AS cnt FROM page_views"),
  ]);
  return {
    totalUsers: parseInt(usersRes.rows[0]?.cnt ?? "0", 10),
    publishedArticles: parseInt(articlesRes.rows[0]?.cnt ?? "0", 10),
    pendingReview: parseInt(pendingRes.rows[0]?.cnt ?? "0", 10),
    totalViews: parseInt(viewsRes.rows[0]?.cnt ?? "0", 10),
  };
}

async function getAuthorViews(authorId: string): Promise<number> {
  const res = await pool.query<{ total: string }>(
    "SELECT COALESCE(SUM(view_count), 0) AS total FROM article WHERE author_id = $1",
    [authorId]
  );
  return parseInt(res.rows[0]?.total ?? "0", 10);
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login");

  const { user } = session;
  const role = (user as { role?: string }).role ?? "user";
  const isAdmin = role === "admin";
  const isModerator = role === "admin" || role === "moderator";
  const isAuthor = role === "admin" || role === "moderator" || role === "author";

  const [articleCounts, adminStats, recentArticles, recentQueue, authorViews] = await Promise.all([
    isAuthor ? countByStatus(isAdmin ? undefined : user.id) : Promise.resolve({} as Record<string, number>),
    isAdmin ? getAdminStats() : Promise.resolve(null),
    isAuthor ? listArticles({ authorId: isAdmin ? undefined : user.id, limit: 5 }) : Promise.resolve([]),
    isModerator ? listArticles({ status: "review", limit: 5 }) : Promise.resolve([]),
    !isAdmin && isAuthor ? getAuthorViews(user.id) : Promise.resolve(null),
  ]);

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

      {/* Stats — only for authors and above */}
      {isAuthor && <div className={styles.statsGrid}>
        {isAdmin && adminStats && <>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Users</p>
            <p className={styles.statValue}>{adminStats.totalUsers}</p>
            <p className={styles.statSub}>Registered accounts</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Published Articles</p>
            <p className={styles.statValue}>{adminStats.publishedArticles}</p>
            <p className={styles.statSub}>Live on site</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Pending Review</p>
            <p className={styles.statValue}>{adminStats.pendingReview}</p>
            <p className={styles.statSub}>Awaiting approval</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Articles</p>
            <p className={styles.statValue}>{articleCounts.all ?? 0}</p>
            <p className={styles.statSub}>All statuses</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Views</p>
            <p className={styles.statValue}>
              {adminStats.totalViews >= 1000
                ? `${(adminStats.totalViews / 1000).toFixed(1)}k`
                : adminStats.totalViews.toLocaleString()}
            </p>
            <p className={styles.statSub}>All content</p>
          </div>
        </>}
        {!isAdmin && isAuthor && <>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>My Articles</p>
            <p className={styles.statValue}>{articleCounts.all ?? 0}</p>
            <p className={styles.statSub}>All time</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Published</p>
            <p className={styles.statValue}>{articleCounts.published ?? 0}</p>
            <p className={styles.statSub}>Live on site</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Drafts</p>
            <p className={styles.statValue}>{articleCounts.draft ?? 0}</p>
            <p className={styles.statSub}>In progress</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Under Review</p>
            <p className={styles.statValue}>{articleCounts.review ?? 0}</p>
            <p className={styles.statSub}>Awaiting approval</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>My Views</p>
            <p className={styles.statValue}>
              {(authorViews ?? 0) >= 1000
                ? `${((authorViews ?? 0) / 1000).toFixed(1)}k`
                : (authorViews ?? 0).toLocaleString()}
            </p>
            <p className={styles.statSub}>Total article views</p>
          </div>
        </>}
      </div>}

      {/* Reader welcome card */}
      {!isAuthor && (
        <section className={styles.section}>
          <div className={styles.profileCard} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "var(--color-ink-muted)", margin: 0 }}>
              You are signed in as a reader. Browse the latest news, or head to your profile to update your details.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/en" style={{ display: "inline-block", padding: "8px 18px", background: "var(--color-ink)", color: "#fff", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.82rem", borderRadius: 6, textDecoration: "none" }}>
                Browse News
              </a>
              <a href="/en/dashboard/profile" style={{ display: "inline-block", padding: "8px 18px", border: "1.5px solid var(--color-border)", color: "var(--color-ink)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.82rem", borderRadius: 6, textDecoration: "none" }}>
                Edit Profile
              </a>
            </div>
          </div>
        </section>
      )}

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

      {/* Author: Recent Articles */}
      {isAuthor && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isAdmin ? "Recent Articles" : "My Recent Articles"}
            </h2>
            <a href="/en/dashboard/articles/new" className={styles.actionBtn}>
              + New Article
            </a>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      No articles yet.{" "}
                      <a href="/en/dashboard/articles/new">Click here</a> to write your first article.
                    </td>
                  </tr>
                ) : (
                  recentArticles.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{a.title_en || a.title_ne || "Untitled"}</span>
                        {a.author_name && isAdmin && (
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-ink-muted)", marginTop: 2 }}>
                            by {a.author_name}
                          </span>
                        )}
                      </td>
                      <td>{a.category || "—"}</td>
                      <td>
                        <span
                          className={styles.roleBadge}
                          style={{
                            background: STATUS_COLORS[a.status] ?? "#64748b",
                            fontSize: "0.68rem",
                            padding: "2px 8px",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        {a.view_count != null && a.view_count > 0 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, color: "var(--color-ink)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            {(a.view_count ?? 0) >= 1000 ? `${((a.view_count ?? 0) / 1000).toFixed(1)}k` : (a.view_count ?? 0).toLocaleString()}
                          </span>
                        ) : <span style={{ color: "var(--color-ink-muted)" }}>—</span>}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        {new Date(a.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <a
                          href={`/en/dashboard/articles/${a.id}/edit`}
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-accent)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {recentArticles.length > 0 && (
            <div style={{ padding: "12px 0 0", textAlign: "right" }}>
              <a
                href="/en/dashboard/articles"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all articles →
              </a>
            </div>
          )}
        </section>
      )}

      {/* Moderator: Queue */}
      {isModerator && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Moderation Queue</h2>
            <a href="/en/dashboard/moderation" className={styles.actionBtn}>
              View All
            </a>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Author</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentQueue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyRow}>
                      No items pending review. Queue is clear.
                    </td>
                  </tr>
                ) : (
                  recentQueue.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.title_en || a.title_ne || "Untitled"}</td>
                      <td>{a.author_name ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        {new Date(a.updated_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <a
                          href="/en/dashboard/moderation"
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-accent)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          Review
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Admin/Moderator: Recent Views */}
      {(isAdmin || isModerator) && (
        <section className={styles.section}>
          <RecentViewsWidget />
        </section>
      )}

      {/* Admin: Summary links */}
      {isAdmin && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Links</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { href: "/en/dashboard/users", label: "User Management" },
              { href: "/en/dashboard/taxonomy", label: "Categories & Tags" },
              { href: "/en/dashboard/menu", label: "Menu Manager" },
              { href: "/en/dashboard/ads", label: "Ad Management" },
              { href: "/en/dashboard/settings", label: "Site Settings" },
              { href: "/en/dashboard/seo", label: "SEO Settings" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  textDecoration: "none",
                  transition: "border-color 0.15s ease",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

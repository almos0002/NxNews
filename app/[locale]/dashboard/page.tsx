import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Header from "@/app/_components/Header";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Footer from "@/app/_components/Footer";
import { breakingHeadline } from "@/app/_data/articles";
import styles from "./dashboard.module.css";
import SignOutButton from "@/app/_components/SignOutButton";

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
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />
      <div className={styles.layout}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.name}</p>
              <p className={styles.profileEmail}>{user.email}</p>
              <span
                className={styles.roleBadge}
                style={{ background: ROLE_COLORS[role] ?? "#64748b" }}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          </div>

          <nav className={styles.nav}>
            <p className={styles.navLabel}>Menu</p>
            <a href="#overview" className={`${styles.navLink} ${styles.active}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Overview
            </a>
            <a href="#profile" className={styles.navLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              My Profile
            </a>
            {isAuthor && (
              <a href="/en/dashboard/articles" className={styles.navLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Articles
              </a>
            )}
            {isModerator && (
              <a href="#moderation" className={styles.navLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Moderation
              </a>
            )}
            {isAdmin && (
              <a href="#users" className={styles.navLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                User Management
              </a>
            )}
          </nav>

          <div className={styles.sidebarFooter}>
            <SignOutButton />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>

          {/* Overview stats */}
          <section id="overview" className={styles.section}>
            <h2 className={styles.sectionTitle}>Overview</h2>
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
          </section>

          {/* My Profile */}
          <section id="profile" className={styles.section}>
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

          {/* Author: Articles */}
          {isAuthor && (
            <section id="articles" className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Articles</h2>
                <button className={styles.actionBtn}>+ New Article</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        No articles yet. Click &ldquo;+ New Article&rdquo; to get started.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Moderator: Queue */}
          {isModerator && (
            <section id="moderation" className={styles.section}>
              <h2 className={styles.sectionTitle}>Moderation Queue</h2>
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
            <section id="users" className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>User Management</h2>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
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

        </main>
      </div>
      <Footer />
    </>
  );
}

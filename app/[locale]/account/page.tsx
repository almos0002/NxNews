import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import { getBookmarks, getReadingHistory } from "@/lib/auth/account";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import styles from "./account.module.css";

export const metadata: Metadata = {
  title: "My Account",
  // Per-user account screens are noindex by definition.
  robots: { index: false, follow: false, nocache: true },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/login?from=/${locale}/account`);
  }

  const { user } = session;
  const locale = await getLocale();

  const [bookmarks, history] = await Promise.all([
    getBookmarks(user.id),
    getReadingHistory(user.id, 20),
  ]);

  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Profile header */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              <h1 className={styles.name}>{user.name}</h1>
              <p className={styles.email}>{user.email}</p>
              {memberSince && (
                <p className={styles.meta}>Member since {memberSince}</p>
              )}
            </div>
            <Link href="/account/edit" className={styles.editBtn}>
              Edit Profile
            </Link>
          </div>

          {/* Bookmarks */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Saved Articles
              </h2>
              <span className={styles.count}>{bookmarks.length}</span>
            </div>

            {bookmarks.length === 0 ? (
              <div className={styles.empty}>
                <p>No saved articles yet.</p>
                <Link href="/" className={styles.emptyLink}>Browse the latest news →</Link>
              </div>
            ) : (
              <div className={styles.bookmarkGrid}>
                {bookmarks.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className={styles.bookmarkCard}>
                    {a.featured_image && (
                      <div className={styles.bookmarkImg}>
                        <Image
                          src={a.featured_image}
                          alt={a.title_en}
                          fill
                          sizes="(max-width: 640px) 100vw, 260px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className={styles.bookmarkBody}>
                      {a.category && <span className={styles.cat}>{a.category}</span>}
                      <p className={styles.bookmarkTitle}>{locale === "ne" && a.title_ne ? a.title_ne : a.title_en}</p>
                      <p className={styles.bookmarkMeta}>
                        {a.author_name && <span>{a.author_name}</span>}
                        {a.published_at && <span>{timeAgo(a.published_at)}</span>}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Reading History */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Reading History
              </h2>
              <span className={styles.count}>{history.length}</span>
            </div>

            {history.length === 0 ? (
              <div className={styles.empty}>
                <p>No reading history yet. Articles you read will appear here.</p>
              </div>
            ) : (
              <ul className={styles.historyList}>
                {history.map((a) => (
                  <li key={a.id} className={styles.historyItem}>
                    {a.featured_image && (
                      <div className={styles.historyThumb}>
                        <Image
                          src={a.featured_image}
                          alt={a.title_en}
                          fill
                          sizes="72px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className={styles.historyBody}>
                      {a.category && <span className={styles.cat}>{a.category}</span>}
                      <Link href={`/article/${a.slug}`} className={styles.historyTitle}>
                        {locale === "ne" && a.title_ne ? a.title_ne : a.title_en}
                      </Link>
                      <p className={styles.historyMeta}>
                        {a.author_name && <span>{a.author_name}</span>}
                        <span>Read {timeAgo(a.read_at)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}

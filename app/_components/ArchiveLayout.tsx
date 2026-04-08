import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import { tags } from "@/app/_data/tags";
import { trendingArticles } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./ArchiveLayout.module.css";

interface ArchiveLayoutProps {
  badge: string;
  title: string;
  description?: string;
  count: number;
  articles: Article[];
  profileSlot?: React.ReactNode;
}

function ArchiveSidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Trending Now */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>Trending Now</h2>
        <ol className={styles.trendingList}>
          {trendingArticles.map((article, i) => (
            <li key={article.id} className={styles.trendingItem}>
              <span className={styles.trendingRank}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.trendingContent}>
                <span className={styles.trendingCategory}>{article.category}</span>
                <a href={`/article/${article.id}`} className={styles.trendingTitle}>
                  {article.title}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Browse Topics */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>Browse Topics</h2>
        <div className={styles.topicList}>
          {tags.map((t) => (
            <a key={t.slug} href={`/tags/${t.slug}`} className={styles.topicPill}>
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className={`${styles.sidebarCard} ${styles.newsletter}`}>
        <p className={styles.newsletterEyebrow}>Free, daily</p>
        <h2 className={styles.newsletterTitle}>The Daily Briefing</h2>
        <p className={styles.newsletterDesc}>
          The most important stories, explained — in your inbox every morning.
        </p>
        <form className={styles.newsletterForm} action="#" method="post">
          <input
            type="email"
            placeholder="Your email address"
            className={styles.newsletterInput}
            aria-label="Email address"
          />
          <button type="submit" className={styles.newsletterBtn}>
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  );
}

export default function ArchiveLayout({
  badge,
  title,
  description,
  count,
  articles,
  profileSlot,
}: ArchiveLayoutProps) {
  return (
    <div className={styles.wrapper}>
      {/* Page hero header */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>{badge}</span>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
          <p className={styles.count}>
            {count === 0
              ? "No articles found"
              : `${count} article${count !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Optional profile slot (author page) */}
        {profileSlot && (
          <div className={styles.profileSlot}>{profileSlot}</div>
        )}

        <div className={styles.layout}>
          {/* Main — article grid */}
          <div className={styles.main}>
            {articles.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  No articles found for this {badge.toLowerCase()}.
                </p>
                <a href="/" className={styles.emptyLink}>
                  Back to homepage →
                </a>
              </div>
            ) : (
              <div className={styles.grid}>
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/article/${article.id}`}
                    className={styles.card}
                  >
                    {article.imageUrl && (
                      <div className={styles.cardImage}>
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 300px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <CategoryBadge category={article.category} />
                      <h2 className={styles.cardTitle}>{article.title}</h2>
                      {article.excerpt && (
                        <p className={styles.cardExcerpt}>{article.excerpt}</p>
                      )}
                      <div className={styles.cardMeta}>
                        <span className={styles.cardAuthor}>
                          {article.author}
                        </span>
                        <span className={styles.cardDot} />
                        <span>{article.readTime} read</span>
                        {article.date && (
                          <>
                            <span className={styles.cardDot} />
                            <span>{article.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <ArchiveSidebar />
        </div>
      </div>
    </div>
  );
}

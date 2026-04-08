import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Article } from "@/app/_data/articles";
import { tags } from "@/app/_data/tags";
import { trendingArticles } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
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

async function ArchiveSidebar() {
  const tArchive = await getTranslations("archive");
  const tNewsletter = await getTranslations("newsletter");

  return (
    <aside className={styles.sidebar}>
      {/* Trending Now */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>{tArchive("trendingNow")}</h2>
        <ol className={styles.trendingList}>
          {trendingArticles.map((article, i) => (
            <li key={article.id} className={styles.trendingItem}>
              <span className={styles.trendingRank}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.trendingContent}>
                <span className={styles.trendingCategory}>{article.category}</span>
                <Link href={`/article/${article.id}`} className={styles.trendingTitle}>
                  {article.title}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Browse Topics */}
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>{tArchive("browseTopics")}</h2>
        <div className={styles.topicList}>
          {tags.map((t) => (
            <Link key={t.slug} href={`/tags/${t.slug}`} className={styles.topicPill}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className={`${styles.sidebarCard} ${styles.newsletter}`}>
        <p className={styles.newsletterEyebrow}>{tNewsletter("eyebrow")}</p>
        <h2 className={styles.newsletterTitle}>{tNewsletter("title")}</h2>
        <p className={styles.newsletterDesc}>{tNewsletter("description")}</p>
        <form className={styles.newsletterForm} action="#" method="post">
          <input
            type="email"
            placeholder={tNewsletter("placeholder")}
            className={styles.newsletterInput}
            aria-label="Email address"
          />
          <button type="submit" className={styles.newsletterBtn}>
            {tNewsletter("button")}
          </button>
        </form>
      </div>
    </aside>
  );
}

export default async function ArchiveLayout({
  badge,
  title,
  description,
  count,
  articles,
  profileSlot,
}: ArchiveLayoutProps) {
  const t = await getTranslations("archive");

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
              ? t("noArticles")
              : `${count} ${count !== 1 ? t("articles") : t("article")}`}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {profileSlot && <div className={styles.profileSlot}>{profileSlot}</div>}

        <div className={styles.layout}>
          <div className={styles.main}>
            {articles.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>{t("noArticles")}</p>
                <Link href="/" className={styles.emptyLink}>{t("backHome")}</Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {articles.map((article) => (
                  <Link
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
                        <span className={styles.cardAuthor}>{article.author}</span>
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
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ArchiveSidebar />
        </div>
      </div>
    </div>
  );
}

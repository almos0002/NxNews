"use client";

import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import { tags } from "@/app/_data/tags";
import { trendingArticles } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import { useT } from "@/app/_i18n/LanguageContext";
import styles from "./ArchiveLayout.module.css";

interface ArchiveLayoutProps {
  badgeKey: string;
  title: string;
  description?: string;
  count: number;
  articles: Article[];
  profileSlot?: React.ReactNode;
}

function ArchiveSidebar() {
  const t = useT();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>{t("sections.trendingNow")}</h2>
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

      <div className={styles.sidebarCard}>
        <h2 className={styles.sidebarHeading}>{t("sections.browseTopics")}</h2>
        <div className={styles.topicList}>
          {tags.map((tag) => (
            <a key={tag.slug} href={`/tags/${tag.slug}`} className={styles.topicPill}>
              {tag.label}
            </a>
          ))}
        </div>
      </div>

      <div className={`${styles.sidebarCard} ${styles.newsletter}`}>
        <p className={styles.newsletterEyebrow}>{t("newsletter.eyebrow")}</p>
        <h2 className={styles.newsletterTitle}>{t("newsletter.morningTitle")}</h2>
        <p className={styles.newsletterDesc}>{t("newsletter.morningDesc")}</p>
        <form className={styles.newsletterForm} action="#" method="post">
          <input
            type="email"
            placeholder={t("newsletter.placeholder")}
            className={styles.newsletterInput}
            aria-label={t("newsletter.placeholder")}
          />
          <button type="submit" className={styles.newsletterBtn}>
            {t("newsletter.btn")}
          </button>
        </form>
      </div>
    </aside>
  );
}

export default function ArchiveLayout({
  badgeKey,
  title,
  description,
  count,
  articles,
  profileSlot,
}: ArchiveLayoutProps) {
  const t = useT();
  const badge = t(badgeKey) || badgeKey;
  const articleWord = count === 1 ? t("archive.article") : t("archive.articles");

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>{badge}</span>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
          <p className={styles.count}>
            {count === 0
              ? t("archive.noArticles")
              : `${count} ${articleWord}`}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {profileSlot && (
          <div className={styles.profileSlot}>{profileSlot}</div>
        )}

        <div className={styles.layout}>
          <div className={styles.main}>
            {articles.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  {t("archive.noArticles")}
                </p>
                <a href="/" className={styles.emptyLink}>
                  {t("archive.backHome")}
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
                        <span>{article.readTime}</span>
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

          <ArchiveSidebar />
        </div>
      </div>
    </div>
  );
}

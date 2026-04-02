import Image from "next/image";
import type { Article } from "@/app/_data/articles";
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
        {profileSlot && <div className={styles.profileSlot}>{profileSlot}</div>}

        {articles.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No articles found for this {badge.toLowerCase()}.</p>
            <a href="/" className={styles.emptyLink}>Back to homepage →</a>
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
                      sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 380px"
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
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

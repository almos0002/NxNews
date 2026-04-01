import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "sidebar" | "grid" | "compact";
}

export default function ArticleCard({
  article,
  variant = "grid",
}: ArticleCardProps) {
  if (variant === "hero") {
    return (
      <article className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.heroContent}>
          <CategoryBadge category={article.category} variant="accent" />
          <h2 className={styles.heroTitle}>{article.title}</h2>
          <p className={styles.heroExcerpt}>{article.excerpt}</p>
          <div className={styles.meta}>
            <span className={styles.author}>By {article.author}</span>
            <span className={styles.dot} aria-hidden="true">
              &middot;
            </span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "sidebar") {
    return (
      <article className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <CategoryBadge category={article.category} variant="outline" />
          <h3 className={styles.sidebarTitle}>{article.title}</h3>
          <div className={styles.meta}>
            <span className={styles.author}>{article.author}</span>
            <span className={styles.dot} aria-hidden="true">
              &middot;
            </span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
        {article.imageUrl && (
          <div className={styles.sidebarImage}>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="120px"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={styles.compact}>
        <CategoryBadge category={article.category} variant="outline" />
        <h3 className={styles.compactTitle}>{article.title}</h3>
        <p className={styles.compactExcerpt}>{article.excerpt}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.dot} aria-hidden="true">
            &middot;
          </span>
          <span className={styles.readTime}>{article.readTime}</span>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.grid}>
      {article.imageUrl && (
        <div className={styles.gridImage}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className={styles.gridContent}>
        <CategoryBadge category={article.category} />
        <h3 className={styles.gridTitle}>{article.title}</h3>
        <p className={styles.gridExcerpt}>{article.excerpt}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.dot} aria-hidden="true">
            &middot;
          </span>
          <span className={styles.readTime}>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}

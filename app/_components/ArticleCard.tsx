import Image from "next/image";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
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
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.heroContent}>
          <CategoryBadge category={article.category} variant="accent" />
          <h2 className={styles.heroTitle}>{article.title}</h2>
          <p className={styles.heroExcerpt}>{article.excerpt}</p>
          <div className={styles.meta}>
            <span className={styles.author}>{article.author}</span>
            <span className={styles.separator}>·</span>
            <time className={styles.date}>{article.date}</time>
            <span className={styles.separator}>·</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link href={`/article/${article.id}`} className={styles.sidebar}>
        {article.imageUrl && (
          <div className={styles.sidebarImage}>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="76px"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div className={styles.sidebarContent}>
          <CategoryBadge category={article.category} />
          <h3 className={styles.sidebarTitle}>{article.title}</h3>
          <div className={styles.meta}>
            <span className={styles.author}>{article.author}</span>
            <span className={styles.separator}>·</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.id}`} className={styles.compact}>
        <div className={styles.compactBar} aria-hidden="true" />
        <div className={styles.compactContent}>
          <CategoryBadge category={article.category} />
          <h3 className={styles.compactTitle}>{article.title}</h3>
          <p className={styles.compactExcerpt}>{article.excerpt}</p>
          <div className={styles.meta}>
            <span className={styles.author}>{article.author}</span>
            <span className={styles.separator}>·</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`} className={styles.grid}>
      {article.imageUrl && (
        <div className={styles.gridImage}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className={styles.gridContent}>
        <CategoryBadge category={article.category} />
        <h3 className={styles.gridTitle}>{article.title}</h3>
        {article.excerpt && (
          <p className={styles.gridExcerpt}>{article.excerpt}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.separator}>·</span>
          <span className={styles.readTime}>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

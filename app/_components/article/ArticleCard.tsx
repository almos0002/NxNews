import Image from "next/image";
import type { PublicArticle as Article } from "@/lib/content/public";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "sidebar" | "grid" | "compact";
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ViewCount({ count }: { count: number }) {
  if (!count || count <= 0) return null;
  return (
    <span className={styles.views}>
      <EyeIcon />
      {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toLocaleString()}
    </span>
  );
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
            {article.viewCount != null && article.viewCount > 0 && (
              <>
                <span className={styles.separator}>·</span>
                <ViewCount count={article.viewCount} />
              </>
            )}
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
            {article.viewCount != null && article.viewCount > 0 && (
              <>
                <span className={styles.separator}>·</span>
                <ViewCount count={article.viewCount} />
              </>
            )}
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
            {article.viewCount != null && article.viewCount > 0 && (
              <>
                <span className={styles.separator}>·</span>
                <ViewCount count={article.viewCount} />
              </>
            )}
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
          {article.viewCount != null && article.viewCount > 0 && (
            <>
              <span className={styles.separator}>·</span>
              <ViewCount count={article.viewCount} />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

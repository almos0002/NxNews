import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./FeaturedPanel.module.css";

export default function FeaturedPanel({
  primary,
  secondary,
}: {
  primary: Article;
  secondary: Article[];
}) {
  return (
    <div className={styles.panel}>
      {/* Primary — large left card with overlay */}
      <a href={`/article/${primary.id}`} className={styles.primary}>
        <div className={styles.primaryImage}>
          <Image
            src={primary.imageUrl}
            alt={primary.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <div className={styles.primaryOverlay}>
            <CategoryBadge category={primary.category} variant="accent" />
            <h2 className={styles.primaryTitle}>{primary.title}</h2>
            <div className={styles.meta}>
              <span className={styles.author}>{primary.author}</span>
              <span className={styles.dot}>·</span>
              <span>{primary.time}</span>
              <span className={styles.dot}>·</span>
              <span>{primary.readTime} read</span>
            </div>
          </div>
        </div>
      </a>

      {/* Secondaries — compact horizontal rows stacked on the right */}
      <div className={styles.secondaryStack}>
        {secondary.map((article, i) => (
          <a href={`/article/${article.id}`} key={article.id} className={styles.secondary}>
            <div className={styles.secondaryImage}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="96px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.secondaryContent}>
              <CategoryBadge category={article.category} />
              <h3 className={styles.secondaryTitle}>{article.title}</h3>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.dot}>·</span>
                <span>{article.readTime}</span>
              </div>
            </div>
            {i < secondary.length - 1 && <div className={styles.divider} />}
          </a>
        ))}
      </div>
    </div>
  );
}

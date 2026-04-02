import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./SplitPanel.module.css";

export default function SplitPanel({
  title,
  articles,
}: {
  title: string;
  articles: Article[];
}) {
  const leftArticles = articles.slice(0, 3);
  const rightArticles = articles.slice(3, 6);
  const leftLead = leftArticles[0];
  const leftRest = leftArticles.slice(1);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.cols}>

        {/* LEFT COLUMN — lead image card + text-only items stacked below */}
        <div className={styles.colLeft}>
          {leftLead && (
            <a href={`/article/${leftLead.id}`} className={styles.leadCard}>
              {leftLead.imageUrl && (
                <div className={styles.leadImage}>
                  <Image
                    src={leftLead.imageUrl}
                    alt={leftLead.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.leadContent}>
                <CategoryBadge category={leftLead.category} />
                <h3 className={styles.leadTitle}>{leftLead.title}</h3>
                <p className={styles.leadExcerpt}>{leftLead.excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.author}>{leftLead.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{leftLead.readTime}</span>
                </div>
              </div>
            </a>
          )}
          {leftRest.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.textItem}>
              <CategoryBadge category={article.category} />
              <h4 className={styles.textTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.dot}>·</span>
                <span>{article.readTime}</span>
              </div>
            </a>
          ))}
        </div>

        {/* RIGHT COLUMN — horizontal thumbnail rows (different design) */}
        <div className={styles.colRight}>
          {rightArticles.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.rowCard}>
              {article.imageUrl && (
                <div className={styles.rowImage}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="90px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.rowContent}>
                <CategoryBadge category={article.category} />
                <h4 className={styles.rowTitle}>{article.title}</h4>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

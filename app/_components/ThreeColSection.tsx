import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./ThreeColSection.module.css";

export default function ThreeColSection({
  title,
  articles,
}: {
  title: string;
  articles: Article[];
}) {
  const lead = articles[0];
  const mid = articles.slice(1, 3);
  const list = articles.slice(3, 7);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.cols}>

        {/* Column 1 — large lead card */}
        <div className={styles.colLead}>
          {lead && (
            <a href={`/article/${lead.id}`} className={styles.leadCard}>
              <div className={styles.leadImage}>
                <Image
                  src={lead.imageUrl}
                  alt={lead.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.leadContent}>
                <CategoryBadge category={lead.category} />
                <h3 className={styles.leadTitle}>{lead.title}</h3>
                <p className={styles.leadExcerpt}>{lead.excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.author}>{lead.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{lead.readTime}</span>
                </div>
              </div>
            </a>
          )}
        </div>

        {/* Column 2 — 2 medium cards with image + title */}
        <div className={styles.colMid}>
          {mid.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.midCard}>
              <div className={styles.midImage}>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.midContent}>
                <CategoryBadge category={article.category} />
                <h3 className={styles.midTitle}>{article.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Column 3 — compact text-only list */}
        <div className={styles.colList}>
          {list.map((article, i) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.listItem}>
              {i > 0 && <div className={styles.listDivider} />}
              <CategoryBadge category={article.category} />
              <h4 className={styles.listTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.dot}>·</span>
                <span>{article.readTime}</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

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
  const col1 = articles.slice(0, 2);
  const col2 = articles.slice(2, 5);
  const col3 = articles.slice(5, 9);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.cols}>

        {/* COLUMN 1 — big image card + 1 text item */}
        <div className={styles.col1}>
          {col1[0] && (
            <a href={`/article/${col1[0].id}`} className={styles.bigCard}>
              {col1[0].imageUrl && (
                <div className={styles.bigImage}>
                  <Image
                    src={col1[0].imageUrl}
                    alt={col1[0].title}
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.bigContent}>
                <CategoryBadge category={col1[0].category} />
                <h3 className={styles.bigTitle}>{col1[0].title}</h3>
                <p className={styles.bigExcerpt}>{col1[0].excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.author}>{col1[0].author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{col1[0].readTime}</span>
                </div>
              </div>
            </a>
          )}
          {col1[1] && (
            <a href={`/article/${col1[1].id}`} className={styles.textItem}>
              <CategoryBadge category={col1[1].category} />
              <h4 className={styles.textTitle}>{col1[1].title}</h4>
              <p className={styles.textExcerpt}>{col1[1].excerpt}</p>
              <div className={styles.meta}>
                <span className={styles.author}>{col1[1].author}</span>
                <span className={styles.dot}>·</span>
                <span>{col1[1].readTime}</span>
              </div>
            </a>
          )}
        </div>

        {/* COLUMN 2 — medium thumbnail rows (image left + title right) */}
        <div className={styles.col2}>
          {col2.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.thumbRow}>
              {article.imageUrl && (
                <div className={styles.thumbImage}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.thumbContent}>
                <CategoryBadge category={article.category} />
                <h4 className={styles.thumbTitle}>{article.title}</h4>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* COLUMN 3 — headline-only text list */}
        <div className={styles.col3}>
          <span className={styles.col3Label}>More Headlines</span>
          {col3.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.headlineItem}>
              <h4 className={styles.headlineTitle}>{article.title}</h4>
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

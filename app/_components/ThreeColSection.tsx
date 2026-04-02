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
  const col1Lead = articles[0];
  const col1Text = articles[1];
  const col2Items = articles.slice(2, 6);   // numbered 01–04
  const col3Items = articles.slice(6, 9);   // numbered 05–07

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.cols}>

        {/* COLUMN 1 — image lead + one text article */}
        <div className={styles.col1}>
          {col1Lead && (
            <a href={`/article/${col1Lead.id}`} className={styles.c1Lead}>
              {col1Lead.imageUrl && (
                <div className={styles.c1Image}>
                  <Image
                    src={col1Lead.imageUrl}
                    alt={col1Lead.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.c1Body}>
                <CategoryBadge category={col1Lead.category} />
                <h3 className={styles.c1Title}>{col1Lead.title}</h3>
                {col1Lead.excerpt && (
                  <p className={styles.c1Excerpt}>{col1Lead.excerpt}</p>
                )}
                <div className={styles.meta}>
                  <span className={styles.author}>{col1Lead.author}</span>
                  <span className={styles.sep}>·</span>
                  <span>{col1Lead.readTime}</span>
                </div>
              </div>
            </a>
          )}
          {col1Text && (
            <a href={`/article/${col1Text.id}`} className={styles.c1TextItem}>
              <CategoryBadge category={col1Text.category} />
              <h4 className={styles.c1TextTitle}>{col1Text.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{col1Text.author}</span>
                <span className={styles.sep}>·</span>
                <span>{col1Text.readTime}</span>
              </div>
            </a>
          )}
        </div>

        {/* RIGHT SECTION — Must Read header spans col2 + col3 */}
        <div className={styles.rightSection}>
          <div className={styles.mustReadHeader}>
            <span className={styles.mustReadLabel}>Must Read</span>
          </div>

          <div className={styles.rightCols}>
            {/* col2 — numbered 01–04 */}
            <div className={styles.col2}>
              {col2Items.map((article, i) => (
                <a key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.numContent}>
                    <CategoryBadge category={article.category} />
                    <h4 className={styles.numTitle}>{article.title}</h4>
                    <div className={styles.meta}>
                      <span className={styles.author}>{article.author}</span>
                      <span className={styles.sep}>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* col3 — continues numbering 05–07 */}
            <div className={styles.col3}>
              {col3Items.map((article, i) => (
                <a key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
                  <span className={styles.num}>{String(col2Items.length + i + 1).padStart(2, "0")}</span>
                  <div className={styles.numContent}>
                    <CategoryBadge category={article.category} />
                    <h4 className={styles.numTitle}>{article.title}</h4>
                    <div className={styles.meta}>
                      <span className={styles.author}>{article.author}</span>
                      <span className={styles.sep}>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

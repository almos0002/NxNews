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
  const col2Items = articles.slice(2, 5);
  const col3Lead = articles[5];
  const col3Rest = articles.slice(6, 9);

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

        {/* COLUMN 2 — bold editorial stacked headlines, no images */}
        <div className={styles.col2}>
          <span className={styles.col2Label}>Must Read</span>
          {col2Items.map((article, i) => (
            <a key={article.id} href={`/article/${article.id}`} className={styles.c2Item}>
              <span className={styles.c2Num}>{String(i + 1).padStart(2, "0")}</span>
              <div className={styles.c2Content}>
                <CategoryBadge category={article.category} />
                <h4 className={styles.c2Title}>{article.title}</h4>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.sep}>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* COLUMN 3 — overlay image card + compact text list */}
        <div className={styles.col3}>
          {col3Lead && col3Lead.imageUrl && (
            <a href={`/article/${col3Lead.id}`} className={styles.c3OverlayCard}>
              <div className={styles.c3OverlayImage}>
                <Image
                  src={col3Lead.imageUrl}
                  alt={col3Lead.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.c3OverlayBody}>
                <CategoryBadge category={col3Lead.category} variant="light" />
                <h3 className={styles.c3OverlayTitle}>{col3Lead.title}</h3>
                <div className={styles.metaLight}>
                  <span className={styles.authorLight}>{col3Lead.author}</span>
                  <span className={styles.sep}>·</span>
                  <span>{col3Lead.readTime}</span>
                </div>
              </div>
            </a>
          )}
          {col3Rest.map((article) => (
            <a key={article.id} href={`/article/${article.id}`} className={styles.c3TextItem}>
              <CategoryBadge category={article.category} />
              <h4 className={styles.c3TextTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.sep}>·</span>
                <span>{article.readTime}</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

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
  const leftLead = articles[0];
  const leftRest = articles.slice(1, 3);
  const rightList = articles.slice(3, 6);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all</a>
      </div>

      <div className={styles.cols}>

        {/* LEFT COLUMN — image lead card + 2 text articles */}
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
              <div className={styles.leadBody}>
                <CategoryBadge category={leftLead.category} />
                <h3 className={styles.leadTitle}>{leftLead.title}</h3>
                {leftLead.excerpt && (
                  <p className={styles.leadExcerpt}>{leftLead.excerpt}</p>
                )}
                <div className={styles.meta}>
                  <span className={styles.author}>{leftLead.author}</span>
                  <span className={styles.sep}>·</span>
                  <span>{leftLead.readTime}</span>
                </div>
              </div>
            </a>
          )}

          {leftRest.map((article) => (
            <a key={article.id} href={`/article/${article.id}`} className={styles.textItem}>
              <CategoryBadge category={article.category} />
              <h4 className={styles.textTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.sep}>·</span>
                <span>{article.readTime}</span>
              </div>
            </a>
          ))}
        </div>

        {/* RIGHT COLUMN — numbered editorial list, no images */}
        <div className={styles.colRight}>
          <span className={styles.colRightLabel}>Also in {title.split("&")[0].trim()}</span>
          {rightList.map((article, i) => (
            <a key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
              <span className={styles.num}>0{i + 1}</span>
              <div className={styles.numContent}>
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
    </section>
  );
}

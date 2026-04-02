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
  const pair = articles.slice(0, 2);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <a href="#" className={styles.seeAll}>See all →</a>
      </div>

      <div className={styles.grid}>
        {pair.map((article) => (
          <a href={`/article/${article.id}`} key={article.id} className={styles.card}>
            <div className={styles.image}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
              <div className={styles.overlay}>
                <CategoryBadge category={article.category} variant="accent" />
                <h3 className={styles.title}>{article.title}</h3>
                <p className={styles.excerpt}>{article.excerpt}</p>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{article.readTime} read</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import styles from "./CategoryLists.module.css";

type Column = {
  label: string;
  articles: Article[];
};

export default function CategoryLists({ columns }: { columns: Column[] }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.cols}>
        {columns.map((col, ci) => (
          <div key={ci} className={styles.col}>
            {/* Column header */}
            <div className={styles.colHeader}>
              <span className={styles.colLabel}>{col.label}</span>
            </div>

            {/* Article list */}
            {col.articles.map((article) => (
              <a
                key={article.id}
                href={`/article/${article.id}`}
                className={styles.item}
              >
                {/* Thumbnail */}
                <div className={styles.thumb}>
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="88px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.thumbPlaceholder} />
                  )}
                </div>

                {/* Text */}
                <div className={styles.itemBody}>
                  <span className={styles.itemCategory}>{article.category}</span>
                  <h4 className={styles.itemTitle}>{article.title}</h4>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemAuthor}>{article.author}</span>
                    <span className={styles.dot}>·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

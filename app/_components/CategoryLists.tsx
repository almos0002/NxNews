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
        {columns.map((col, ci) => {
          const lead = col.articles[0];
          const rest = col.articles.slice(1);
          return (
            <div key={ci} className={styles.card}>

              {/* Column header */}
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{col.label}</span>
              </div>

              {/* Lead article — big image + title below */}
              {lead && (
                <a href={`/article/${lead.id}`} className={styles.lead}>
                  {lead.imageUrl && (
                    <div className={styles.leadImage}>
                      <Image
                        src={lead.imageUrl}
                        alt={lead.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={styles.leadBody}>
                    <span className={styles.leadCat}>{lead.category}</span>
                    <h3 className={styles.leadTitle}>{lead.title}</h3>
                    {lead.excerpt && (
                      <p className={styles.leadExcerpt}>{lead.excerpt}</p>
                    )}
                    <div className={styles.meta}>
                      <span className={styles.author}>{lead.author}</span>
                      <span className={styles.dot}>·</span>
                      <span>{lead.readTime}</span>
                    </div>
                  </div>
                </a>
              )}

              {/* Remaining articles — text only, no image */}
              {rest.map((article) => (
                <a key={article.id} href={`/article/${article.id}`} className={styles.textRow}>
                  <span className={styles.textCat}>{article.category}</span>
                  <h4 className={styles.textTitle}>{article.title}</h4>
                  <div className={styles.meta}>
                    <span className={styles.author}>{article.author}</span>
                    <span className={styles.dot}>·</span>
                    <span>{article.readTime}</span>
                  </div>
                </a>
              ))}

            </div>
          );
        })}
      </div>
    </section>
  );
}

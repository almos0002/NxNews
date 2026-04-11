import Image from "next/image";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import styles from "./CategoryLists.module.css";

type Column = {
  label: string;
  articles: Article[];
  href?: string;
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
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{col.label}</span>
                {col.href && (
                  <Link href={col.href} className={styles.viewAll}>View All</Link>
                )}
              </div>

              {lead && (
                <Link href={`/article/${lead.id}`} className={styles.lead}>
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
                      {lead.viewCount != null && lead.viewCount > 0 && (
                        <>
                          <span className={styles.dot}>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            {lead.viewCount >= 1000 ? `${(lead.viewCount / 1000).toFixed(1)}k` : lead.viewCount.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {rest.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`} className={styles.textRow}>
                  <span className={styles.textCat}>{article.category}</span>
                  <h4 className={styles.textTitle}>{article.title}</h4>
                  <div className={styles.meta}>
                    <span className={styles.author}>{article.author}</span>
                    <span className={styles.dot}>·</span>
                    <span>{article.readTime}</span>
                    {article.viewCount != null && article.viewCount > 0 && (
                      <>
                        <span className={styles.dot}>·</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {article.viewCount >= 1000 ? `${(article.viewCount / 1000).toFixed(1)}k` : article.viewCount.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { trendingArticles } from "@/app/_data/articles";
import styles from "./TrendingSidebar.module.css";

export default function TrendingSidebar() {
  return (
    <aside className={styles.aside}>
      <div className={styles.heading}>
        <span className={styles.headingAccent} aria-hidden="true" />
        <h2 className={styles.headingText}>Most Read</h2>
      </div>
      <ol className={styles.list}>
        {trendingArticles.map((article, index) => (
          <li key={article.id} className={styles.item}>
            <span className={styles.rank}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.itemContent}>
              <span className={styles.category}>{article.category}</span>
              <h3 className={styles.title}>{article.title}</h3>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

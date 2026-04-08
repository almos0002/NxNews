"use client";

import { trendingArticles } from "@/app/_data/articles";
import { useT } from "@/app/_i18n/LanguageContext";
import styles from "./TrendingSidebar.module.css";

export default function TrendingSidebar() {
  const t = useT();
  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>{t("sections.trendingNow")}</h2>
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

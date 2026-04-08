"use client";

import type { Article } from "@/app/_data/articles";
import { useT } from "@/app/_i18n/LanguageContext";
import CategoryBadge from "./CategoryBadge";
import styles from "./LatestFeed.module.css";

export default function LatestFeed({ articles }: { articles: Article[] }) {
  const t = useT();
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.pulse} aria-hidden="true" />
        <h2 className={styles.heading}>{t("sections.latestTitle")}</h2>
        <span className={styles.updateNote}>{t("sections.updatedContinuously")}</span>
      </div>
      <div className={styles.feed}>
        {articles.map((article) => (
          <a href={`/article/${article.id}`} key={article.id} className={styles.item}>
            <div className={styles.itemLeft}>
              <time className={styles.time}>{article.time}</time>
              <CategoryBadge category={article.category} />
            </div>
            <h3 className={styles.title}>{article.title}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}

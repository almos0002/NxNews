"use client";

import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import { useT } from "@/app/_i18n/LanguageContext";
import CategoryBadge from "./CategoryBadge";
import styles from "./EditorsPick.module.css";

export default function EditorsPick({ articles }: { articles: Article[] }) {
  const t = useT();
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{t("sections.editorsPick")}</span>
        <p className={styles.sub}>{t("sections.editorsSub")}</p>
      </div>
      <div className={styles.grid}>
        {articles.map((article) => (
          <a href={`/article/${article.id}`} key={article.id} className={styles.card}>
            <div className={styles.image}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.content}>
              <CategoryBadge category={article.category} />
              <h3 className={styles.title}>{article.title}</h3>
              <p className={styles.excerpt}>{article.excerpt}</p>
              <span className={styles.readTime}>{article.readTime} {t("article.minRead")}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

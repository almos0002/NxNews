import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./EditorsPick.module.css";

export default function EditorsPick({ articles }: { articles: Article[] }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Editor&apos;s Pick</span>
        <p className={styles.sub}>Selected reads from our team</p>
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
              <span className={styles.readTime}>{article.readTime} read</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./TopicSection.module.css";

export default function TopicSection({
  title,
  articles,
}: {
  title: string;
  articles: Article[];
}) {
  const [lead, ...rest] = articles;

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.rule} />
        <a href={`/${title.toLowerCase().replace(/\s+&\s+/, "-")}`} className={styles.seeAll}>
          See all →
        </a>
      </div>

      <div className={styles.layout}>
        <a href={`/article/${lead.id}`} className={styles.lead}>
          <div className={styles.leadImage}>
            <Image
              src={lead.imageUrl}
              alt={lead.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.leadContent}>
            <CategoryBadge category={lead.category} />
            <h3 className={styles.leadTitle}>{lead.title}</h3>
            <p className={styles.leadExcerpt}>{lead.excerpt}</p>
            <div className={styles.meta}>
              <span className={styles.author}>{lead.author}</span>
              <span className={styles.dot}>·</span>
              <span>{lead.readTime}</span>
            </div>
          </div>
        </a>

        <div className={styles.stack}>
          {rest.map((article) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.stacked}>
              <div className={styles.stackedImage}>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.stackedContent}>
                <CategoryBadge category={article.category} />
                <h4 className={styles.stackedTitle}>{article.title}</h4>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
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

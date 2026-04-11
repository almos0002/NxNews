import Image from "next/image";
import type { Article } from "@/app/_data/articles";
import CategoryBadge from "./CategoryBadge";
import styles from "./TopicSection.module.css";

function ArticleImageCard({ article }: { article: Article }) {
  return (
    <a href={`/article/${article.id}`} className={styles.card}>
      <div className={styles.cardImage}>
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.cardContent}>
        <CategoryBadge category={article.category} />
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.cardExcerpt}>{article.excerpt}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.dot}>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </a>
  );
}

function LeadCard({ article }: { article: Article }) {
  return (
    <a href={`/article/${article.id}`} className={`${styles.card} ${styles.leadCard}`}>
      <div className={styles.leadImage}>
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.cardContent}>
        <CategoryBadge category={article.category} />
        <h3 className={styles.leadTitle}>{article.title}</h3>
        <p className={styles.cardExcerpt}>{article.excerpt}</p>
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.dot}>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </a>
  );
}

function SideCard({ article }: { article: Article }) {
  return (
    <a href={`/article/${article.id}`} className={styles.sideCard}>
      <div className={styles.sideCardImage}>
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.sideCardContent}>
        <CategoryBadge category={article.category} />
        <h4 className={styles.sideCardTitle}>{article.title}</h4>
        <div className={styles.meta}>
          <span className={styles.author}>{article.author}</span>
          <span className={styles.dot}>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </a>
  );
}

export default function TopicSection({
  title,
  articles,
  columns = 3,
}: {
  title: string;
  articles: Article[];
  columns?: 2 | 3;
}) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.rule} />
        <a href={`/${title.toLowerCase().replace(/\s+&\s+/, "-")}`} className={styles.seeAll}>
          See all
        </a>
      </div>

      {columns === 3 ? (
        <div className={styles.threeCol}>
          {articles.slice(0, 3).map((article) => (
            <ArticleImageCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className={styles.twoCol}>
          <LeadCard article={articles[0]} />
          <div className={styles.sideStack}>
            {articles.slice(1, 3).map((article) => (
              <SideCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import styles from "./LatestFeed.module.css";

export default async function LatestFeed({ articles }: { articles: Article[] }) {
  const t = await getTranslations("home");

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.pulse} aria-hidden="true" />
        <h2 className={styles.heading}>{t("latest")}</h2>
        <span className={styles.updateNote}>{t("updatedContinuously")}</span>
        <Link href="/latest" className={styles.viewAll}>{t("seeAll")}</Link>
      </div>
      <div className={styles.feed}>
        {articles.map((article) => (
          <Link href={`/article/${article.id}`} key={article.id} className={styles.item}>
            <div className={styles.itemLeft}>
              <time className={styles.time}>{article.time}</time>
              <CategoryBadge category={article.category} />
            </div>
            <h3 className={styles.title}>{article.title}</h3>
            <span className={styles.readTime}>{article.readTime}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

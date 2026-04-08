import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Article } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import styles from "./EntertainmentSection.module.css";

export default async function EntertainmentSection({
  articles,
}: {
  articles: Article[];
}) {
  const t = await getTranslations("home");
  const items = articles.slice(0, 4);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("entertainment")}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.grid}>
        {items.map((article) => (
          <Link key={article.id} href={`/article/${article.id}`} className={styles.card}>
            {article.imageUrl && (
              <div className={styles.imageWrap}>
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <div className={styles.body}>
              <CategoryBadge category={article.category} />
              <h4 className={styles.cardTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.dot} />
                <span>{article.readTime} {t("readMin")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

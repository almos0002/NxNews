import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { PublicArticle as Article } from "@/lib/public";
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
        <Link href="/entertainment" className={styles.seeAll}>{t("seeAll")}</Link>
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
                {article.viewCount != null && article.viewCount > 0 && (
                  <>
                    <span className={styles.dot} />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {article.viewCount >= 1000 ? `${(article.viewCount / 1000).toFixed(1)}k` : article.viewCount.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

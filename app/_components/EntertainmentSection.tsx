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
  const featured = articles[0];
  const grid = articles.slice(1, 6);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("entertainment")}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.layout}>
        {/* Featured article — large left card */}
        {featured && (
          <Link href={`/article/${featured.id}`} className={styles.featured}>
            {featured.imageUrl && (
              <div className={styles.featuredImage}>
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}
            <div className={styles.featuredBody}>
              <CategoryBadge category={featured.category} />
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              {featured.excerpt && (
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              )}
              <div className={styles.meta}>
                <span className={styles.author}>{featured.author}</span>
                <span className={styles.dot} />
                <span>{featured.readTime} {t("readMin")}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Right grid — 2×2 + 1 smaller articles */}
        <div className={styles.grid}>
          {grid.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`} className={styles.card}>
              {article.imageUrl && (
                <div className={styles.cardImage}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.cardBody}>
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
      </div>
    </section>
  );
}

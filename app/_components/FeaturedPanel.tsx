import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import styles from "./FeaturedPanel.module.css";

export default async function FeaturedPanel({
  primary,
  secondary,
}: {
  primary: Article;
  secondary: Article[];
}) {
  const t = await getTranslations("home");

  return (
    <div className={styles.panel}>
      <Link href={`/article/${primary.id}`} className={styles.primary}>
        <div className={styles.primaryImage}>
          <Image
            src={primary.imageUrl}
            alt={primary.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <div className={styles.primaryOverlay}>
            <CategoryBadge category={primary.category} variant="accent" />
            <h2 className={styles.primaryTitle}>{primary.title}</h2>
            <div className={styles.meta}>
              <span className={styles.author}>{primary.author}</span>
              <span className={styles.dot}>·</span>
              <span>{primary.time}</span>
              <span className={styles.dot}>·</span>
              <span>{primary.readTime} {t("readMin")}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className={styles.secondaryStack}>
        {secondary.map((article) => (
          <Link href={`/article/${article.id}`} key={article.id} className={styles.secondary}>
            <div className={styles.secondaryImage}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 900px) 33vw, 40vw"
                style={{ objectFit: "cover" }}
              />
              <div className={styles.secondaryOverlay}>
                <CategoryBadge category={article.category} variant="accent" />
                <h3 className={styles.secondaryTitle}>{article.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.author}>{article.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

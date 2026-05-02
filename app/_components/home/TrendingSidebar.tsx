import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getTrendingArticles } from "@/lib/content/public";
import { Link } from "@/i18n/navigation";
import AdUnit from "../ads/AdUnit";
import styles from "./TrendingSidebar.module.css";

export default async function TrendingSidebar() {
  const t = await getTranslations("archive");
  const locale = await getLocale();

  let allItems = await getTrendingArticles(locale, 9);
  if (allItems.length === 0) {
    allItems = [];
  }

  const items = allItems.slice(0, allItems.length > 1 ? allItems.length - 1 : allItems.length);
  const splitAt = Math.ceil(items.length / 2);
  const topItems = items.slice(0, splitAt);
  const bottomItems = items.slice(splitAt);

  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>{t("trendingNow")}</h2>
      <ol className={styles.list}>
        {topItems.map((article, index) => (
          <li key={article.id} className={styles.item}>
            <span className={styles.rank}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.itemContent}>
              <span className={styles.category}>{article.category}</span>
              <Link href={`/article/${article.id}`} className={styles.title}>
                {article.title}
              </Link>
            </div>
          </li>
        ))}

        <li className={styles.adItem} aria-hidden="true">
          <AdUnit variant="fluid" />
        </li>

        {bottomItems.map((article, index) => (
          <li key={article.id} className={styles.item}>
            <span className={styles.rank}>
              {String(splitAt + index + 1).padStart(2, "0")}
            </span>
            <div className={styles.itemContent}>
              <span className={styles.category}>{article.category}</span>
              <Link href={`/article/${article.id}`} className={styles.title}>
                {article.title}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

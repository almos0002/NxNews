import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { trendingArticles } from "@/app/_data/articles";
import { localizeTrending } from "@/app/_data/localize";
import { Link } from "@/i18n/navigation";
import AdSlot from "./AdSlot";
import styles from "./TrendingSidebar.module.css";

export default async function TrendingSidebar() {
  const t = await getTranslations("archive");
  const locale = await getLocale();
  const allItems = localizeTrending(trendingArticles, locale);

  // Show one fewer article to make room for the inline ad
  const items = allItems.slice(0, allItems.length - 1);
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

        {/* Inline ad — occupies the same slot as a removed article */}
        <li className={styles.adItem} aria-hidden="true">
          <AdSlot variant="fluid" />
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

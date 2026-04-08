import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { trendingArticles } from "@/app/_data/articles";
import { localizeTrending } from "@/app/_data/localize";
import { Link } from "@/i18n/navigation";
import styles from "./TrendingSidebar.module.css";

export default async function TrendingSidebar() {
  const t = await getTranslations("archive");
  const locale = await getLocale();
  const items = localizeTrending(trendingArticles, locale);

  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>{t("trendingNow")}</h2>
      <ol className={styles.list}>
        {items.map((article, index) => (
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
      </ol>
    </aside>
  );
}

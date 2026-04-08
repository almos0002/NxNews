import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Article } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import AdSlot from "./AdSlot";
import styles from "./ThreeColSection.module.css";

export default async function ThreeColSection({
  title,
  articles,
}: {
  title: string;
  articles: Article[];
}) {
  const t = await getTranslations("home");

  const col1Lead  = articles[0];
  const col1Texts = articles.slice(1, 4);
  // Reduced by 1 each: was [4..8] and [9..13], now [4..7] and [9..12]
  const col2Items = articles.slice(4, 8);
  const col3Items = articles.slice(9, 13);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.cols}>
        <div className={styles.col1}>
          {col1Lead && (
            <Link href={`/article/${col1Lead.id}`} className={styles.c1Lead}>
              {col1Lead.imageUrl && (
                <div className={styles.c1Image}>
                  <Image
                    src={col1Lead.imageUrl}
                    alt={col1Lead.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.c1Body}>
                <CategoryBadge category={col1Lead.category} />
                <h3 className={styles.c1Title}>{col1Lead.title}</h3>
                {col1Lead.excerpt && (
                  <p className={styles.c1Excerpt}>{col1Lead.excerpt}</p>
                )}
                <div className={styles.meta}>
                  <span className={styles.author}>{col1Lead.author}</span>
                  <span className={styles.sep}>·</span>
                  <span>{col1Lead.readTime}</span>
                </div>
              </div>
            </Link>
          )}

          {col1Texts.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`} className={styles.c1TextItem}>
              <CategoryBadge category={article.category} />
              <h4 className={styles.c1TextTitle}>{article.title}</h4>
              <div className={styles.meta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.sep}>·</span>
                <span>{article.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.rightSection}>
          <div className={styles.mustReadHeader}>
            <span className={styles.mustReadLabel}>{t("mustRead")}</span>
          </div>

          <div className={styles.rightCols}>
            {/* Column 2 — 4 articles + 1 ad cell */}
            <div className={styles.col2}>
              {col2Items.map((article, i) => (
                <Link key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.numContent}>
                    <CategoryBadge category={article.category} />
                    <h4 className={styles.numTitle}>{article.title}</h4>
                    <div className={styles.meta}>
                      <span className={styles.author}>{article.author}</span>
                      <span className={styles.sep}>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {/* Ad replacing the removed 5th article */}
              <div className={styles.adCell} aria-hidden="true">
                <AdSlot variant="fluid" />
              </div>
            </div>

            {/* Column 3 — 4 articles + 1 ad cell */}
            <div className={styles.col3}>
              {col3Items.map((article, i) => (
                <Link key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
                  <span className={styles.num}>{String(col2Items.length + i + 1).padStart(2, "0")}</span>
                  <div className={styles.numContent}>
                    <CategoryBadge category={article.category} />
                    <h4 className={styles.numTitle}>{article.title}</h4>
                    <div className={styles.meta}>
                      <span className={styles.author}>{article.author}</span>
                      <span className={styles.sep}>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {/* Ad replacing the removed 5th article */}
              <div className={styles.adCell} aria-hidden="true">
                <AdSlot variant="fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

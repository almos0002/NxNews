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
  // Col 1 text items: 2 articles → numbered 01, 02
  const col1Texts = articles.slice(1, 3);
  // Col 2: 4 articles → numbered 03–06 (offset = col1Texts.length = 2)
  const col2Items = articles.slice(4, 8);
  const col2Offset = col1Texts.length; // 2
  // Col 3: 4 articles → numbered 07–10 (offset = col1Texts.length + col2Items.length = 6)
  const col3Items = articles.slice(9, 13);
  const col3Offset = col1Texts.length + col2Items.length; // 6

  // Ad positions (staggered across columns)
  // Col 1 ad: after text item 0  → "up"
  // Col 2 ad: after article 1    → "middle"
  // Col 3 ad: after article 2    → "down"
  const COL1_AD_AT = 1;
  const COL2_AD_AT = 2;
  const COL3_AD_AT = 3;

  const numberedItem = (article: Article, num: number) => (
    <Link key={article.id} href={`/article/${article.id}`} className={styles.numberedItem}>
      <span className={styles.num}>{String(num).padStart(2, "0")}</span>
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
  );

  const adCell = (
    <div className={styles.adCell} aria-hidden="true">
      <AdSlot variant="fluid" />
    </div>
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.cols}>
        {/* ── Column 1: hero image + 2 numbered text items with ad between ── */}
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

          {col1Texts.slice(0, COL1_AD_AT).map((article, i) =>
            numberedItem(article, i + 1)
          )}

          {/* Col 1 ad — "up" position */}
          {adCell}

          {col1Texts.slice(COL1_AD_AT).map((article, i) =>
            numberedItem(article, COL1_AD_AT + i + 1)
          )}
        </div>

        {/* ── Right section: Must Read header + col2 + col3 ── */}
        <div className={styles.rightSection}>
          <div className={styles.mustReadHeader}>
            <span className={styles.mustReadLabel}>{t("mustRead")}</span>
          </div>

          <div className={styles.rightCols}>
            {/* Column 2 — ad in "middle" position (after item 1) */}
            <div className={styles.col2}>
              {col2Items.slice(0, COL2_AD_AT).map((article, i) =>
                numberedItem(article, col2Offset + i + 1)
              )}

              {adCell}

              {col2Items.slice(COL2_AD_AT).map((article, i) =>
                numberedItem(article, col2Offset + COL2_AD_AT + i + 1)
              )}
            </div>

            {/* Column 3 — ad in "down" position (after item 2) */}
            <div className={styles.col3}>
              {col3Items.slice(0, COL3_AD_AT).map((article, i) =>
                numberedItem(article, col3Offset + i + 1)
              )}

              {adCell}

              {col3Items.slice(COL3_AD_AT).map((article, i) =>
                numberedItem(article, col3Offset + COL3_AD_AT + i + 1)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

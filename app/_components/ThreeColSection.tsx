import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import AdUnit from "./AdUnit";
import styles from "./ThreeColSection.module.css";

export default async function ThreeColSection({
  title,
  articles,
  href,
}: {
  title: string;
  articles: Article[];
  href?: string;
}) {
  const t = await getTranslations("home");

  // col1Lead = articles[0] → numbered 01
  const col1Lead  = articles[0];
  // col1Texts: articles[1..2] → numbered 02, 03
  const col1Texts = articles.slice(1, 3);
  // col2: articles[4..7] → numbered 04..07  (offset = 1 lead + 2 text = 3)
  const col2Items  = articles.slice(4, 8);
  const col2Offset = 3; // 1 (lead) + 2 (col1Texts)
  // col3: articles[9..12] → numbered 08..11  (offset = 3 + 4 = 7)
  const col3Items  = articles.slice(9, 13);
  const col3Offset = col2Offset + col2Items.length; // 7

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
          {article.viewCount != null && article.viewCount > 0 && (
            <>
              <span className={styles.sep}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {article.viewCount >= 1000 ? `${(article.viewCount / 1000).toFixed(1)}k` : article.viewCount.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );

  const adCell = (
    <div className={styles.adCell} aria-hidden="true">
      <AdUnit variant="fluid" />
    </div>
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.rule} />
        {href
          ? <Link href={href} className={styles.seeAll}>{t("seeAll")}</Link>
          : <span className={styles.seeAll}>{t("seeAll")}</span>
        }
      </div>

      <div className={styles.cols}>
        {/* ── Column 1: item 01 with thumbnail + items 02, 03 ── */}
        <div className={styles.col1}>
          {col1Lead && (
            <Link href={`/article/${col1Lead.id}`} className={styles.leadItem}>
              {col1Lead.imageUrl && (
                <div className={styles.leadImage}>
                  <Image
                    src={col1Lead.imageUrl}
                    alt={col1Lead.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.leadBody}>
                <span className={styles.num}>01</span>
                <div className={styles.numContent}>
                  <CategoryBadge category={col1Lead.category} />
                  <h4 className={styles.numTitle}>{col1Lead.title}</h4>
                  <div className={styles.meta}>
                    <span className={styles.author}>{col1Lead.author}</span>
                    <span className={styles.sep}>·</span>
                    <span>{col1Lead.readTime}</span>
                    {col1Lead.viewCount != null && col1Lead.viewCount > 0 && (
                      <>
                        <span className={styles.sep}>·</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          {col1Lead.viewCount >= 1000 ? `${(col1Lead.viewCount / 1000).toFixed(1)}k` : col1Lead.viewCount.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {col1Texts.map((article, i) =>
            numberedItem(article, i + 2)
          )}

          {/* Col 1 fluid ad at bottom */}
          {adCell}
        </div>

        {/* ── Right section: Must Read header + col2 + col3 ── */}
        <div className={styles.rightSection}>
          <div className={styles.mustReadHeader}>
            <span className={styles.mustReadLabel}>{t("mustRead")}</span>
          </div>

          <div className={styles.rightCols}>
            {/* Column 2 — numbered 04..07, ad in middle */}
            <div className={styles.col2}>
              {col2Items.slice(0, COL2_AD_AT).map((article, i) =>
                numberedItem(article, col2Offset + i + 1)
              )}

              {adCell}

              {col2Items.slice(COL2_AD_AT).map((article, i) =>
                numberedItem(article, col2Offset + COL2_AD_AT + i + 1)
              )}
            </div>

            {/* Column 3 — numbered 08..11, ad near bottom */}
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

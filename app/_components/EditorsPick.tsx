import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { PublicArticle as Article } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import CategoryBadge from "./CategoryBadge";
import styles from "./EditorsPick.module.css";

export default async function EditorsPick({ articles }: { articles: Article[] }) {
  const t = await getTranslations("home");

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{t("editorsPick")}</span>
        <p className={styles.sub}>{t("editorsPickSub")}</p>
      </div>
      <div className={styles.grid}>
        {articles.map((article) => (
          <Link href={`/article/${article.id}`} key={article.id} className={styles.card}>
            <div className={styles.image}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.content}>
              <CategoryBadge category={article.category} />
              <h3 className={styles.title}>{article.title}</h3>
              <p className={styles.excerpt}>{article.excerpt}</p>
              <span className={styles.readTime}>{article.readTime} {t("readMin")}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

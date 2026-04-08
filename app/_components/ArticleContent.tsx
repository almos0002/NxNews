"use client";

import Image from "next/image";
import CategoryBadge from "./CategoryBadge";
import { useT } from "@/app/_i18n/LanguageContext";
import type { Article } from "@/app/_data/articles";
import styles from "@/app/article/[id]/page.module.css";

interface ArticleContentProps {
  article: Article;
  body: string[];
  related: Article[];
}

export default function ArticleContent({ article, body, related }: ArticleContentProps) {
  const t = useT();

  function handleCopyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }

  return (
    <main className={styles.main}>
      {/* Article header */}
      <div className={styles.articleHeader}>
        <div className={styles.categoryRow}>
          <CategoryBadge category={article.category} />
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        {article.excerpt && (
          <p className={styles.excerpt}>{article.excerpt}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.author}>{t("article.by")} {article.author}</span>
          <span className={styles.metaDot} />
          <span>{article.date}</span>
          {article.time && (
            <>
              <span className={styles.metaDot} />
              <span>{article.time}</span>
            </>
          )}
          <span className={styles.metaDot} />
          <span>{article.readTime}</span>
        </div>

        {/* Share row */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} aria-label="Share on X">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t("article.share")}
          </button>
          <button className={styles.actionBtn} aria-label="Share on LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {t("article.share")}
          </button>
          <button className={styles.actionBtn} aria-label="Copy link" onClick={handleCopyLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {t("article.copyLink")}
          </button>
        </div>
      </div>

      {/* Hero image */}
      {article.imageUrl && (
        <div className={styles.heroImage}>
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 860px) 100vw, 860px"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      {/* Article body + sidebar */}
      <div className={styles.layout}>
        <article className={styles.body}>
          {body.map((para, i) => (
            <p key={i} className={styles.para}>{para}</p>
          ))}

          <div className={styles.pullQuote}>
            <blockquote className={styles.quote}>
              {article.excerpt || body[1]}
            </blockquote>
          </div>

          {body.slice(Math.ceil(body.length / 2)).map((para, i) => (
            <p key={`b${i}`} className={styles.para}>{para}</p>
          ))}

          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>{t("article.topics")}:</span>
            <span className={styles.tag}>{article.category}</span>
            <span className={styles.tag}>The Daily Report</span>
          </div>
        </article>

        {/* Sticky sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <span className={styles.sidebarLabel}>{t("article.aboutAuthor")}</span>
            <div className={styles.authorCard}>
              <div className={styles.authorAvatar}>
                {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className={styles.authorName}>{article.author}</p>
                <p className={styles.authorRole}>{article.category} {t("article.correspondent")}</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <span className={styles.sidebarLabel}>{t("sections.newsletter")}</span>
            <p className={styles.sidebarText}>{t("article.newsletterDesc")}</p>
            <a href="/subscribe" className={styles.sidebarCta}>{t("article.subscribeFree")}</a>
          </div>
        </aside>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHeading}>
            <h2 className={styles.relatedTitle}>{t("article.relatedNews")}</h2>
            <div className={styles.relatedRule} />
          </div>
          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <a key={r.id} href={`/article/${r.id}`} className={styles.relatedCard}>
                {r.imageUrl && (
                  <div className={styles.relatedImage}>
                    <Image
                      src={r.imageUrl}
                      alt={r.title}
                      fill
                      sizes="(max-width: 600px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className={styles.relatedBody}>
                  <CategoryBadge category={r.category} />
                  <h3 className={styles.relatedCardTitle}>{r.title}</h3>
                  {r.excerpt && (
                    <p className={styles.relatedExcerpt}>{r.excerpt}</p>
                  )}
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedAuthor}>{r.author}</span>
                    <span className={styles.relatedDot} />
                    <span>{r.readTime}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

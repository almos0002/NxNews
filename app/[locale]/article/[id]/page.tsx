import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import CategoryBadge from "@/app/_components/article/CategoryBadge";
import AdUnit from "@/app/_components/ads/AdUnit";
import ViewTracker from "@/app/_components/article/ViewTracker";
import BookmarkButton from "@/app/_components/article/BookmarkButton";
import { auth } from "@/lib/auth/auth";
import { isBookmarked } from "@/lib/auth/account";

import {
  getPublicArticleBySlug,
  getRelatedPublicArticles,
  getBreakingHeadline,
} from "@/lib/content/public";
import { Link } from "@/i18n/navigation";
import styles from "./page.module.css";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const article = await getPublicArticleBySlug(id, locale);
  if (!article) return { title: "Article — KumariHub" };

  const title = `${article.title} — KumariHub`;
  const description = article.excerpt || undefined;
  const image = article.imageUrl || undefined;
  const canonicalPath = `/article/${id}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalPath,
      languages: { en: `/en/article/${id}`, ne: `/ne/article/${id}` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalPath,
      images: image ? [{ url: image, width: 1200, height: 630, alt: article.title }] : undefined,
      publishedTime: article.publishedAt || undefined,
      modifiedTime:  article.updatedAt   || undefined,
      section: article.category || undefined,
      tags: article.tags?.length ? article.tags : undefined,
      locale: locale === "ne" ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id, locale } = await params;

  const [article, headline, session] = await Promise.all([
    getPublicArticleBySlug(id, locale),
    getBreakingHeadline(locale),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);

  if (!article) notFound();

  const [related, bookmarked] = await Promise.all([
    getRelatedPublicArticles(id, article.category, locale, 4),
    session?.user?.id && article.rawId
      ? isBookmarked(session.user.id, article.rawId)
      : Promise.resolve(false),
  ]);

  const t = await getTranslations("article");

  const content = article.content || "";
  const hasHtml = content.includes("<");

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      {article.rawId && (
        <ViewTracker type="article" id={article.rawId} />
      )}

      <main className={styles.main}>
        <div className={styles.articleHeader}>
          <div className={styles.categoryRow}>
            <CategoryBadge category={article.category} />
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
          <div className={styles.meta}>
            <span className={styles.author}>{t("by")} {article.author}</span>
            <span className={styles.metaDot} />
            <span>{article.date}</span>
            {article.time && (
              <>
                <span className={styles.metaDot} />
                <span>{article.time}</span>
              </>
            )}
            <span className={styles.metaDot} />
            <span>{article.readTime} {t("minRead")}</span>
            {typeof article.viewCount === "number" && article.viewCount > 0 && (
              <>
                <span className={styles.metaDot} />
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 3 }} aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {article.viewCount.toLocaleString()}
                </span>
              </>
            )}
          </div>

          <div className={styles.actions}>
            {article.rawId && (
              <BookmarkButton
                articleId={article.rawId}
                initialBookmarked={!!bookmarked}
                isLoggedIn={!!session?.user}
              />
            )}
            <button className={styles.actionBtn} aria-label="Share on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t("share")}
            </button>
            <button className={styles.actionBtn} aria-label="Share on LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t("share")}
            </button>
            <button className={styles.actionBtn} aria-label="Copy link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {t("copyLink")}
            </button>
          </div>
        </div>

        <div className={styles.inArticleAd}>
          <AdUnit variant="leaderboard" />
        </div>

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

        <div className={styles.layout}>
          <article className={styles.body}>
            {hasHtml ? (
              <div
                className={styles.richContent}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              content.split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} className={styles.para}>{para}</p>
              ))
            )}

            {article.tags && article.tags.length > 0 && (
              <div className={styles.tagRow}>
                <span className={styles.tagLabel}>{t("topics")}</span>
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`} className={styles.tag}>
                    {tag.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            )}
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t("aboutAuthor")}</span>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className={styles.authorName}>{article.author}</p>
                  <p className={styles.authorRole}>{article.category} {t("correspondent")}</p>
                </div>
              </div>
            </div>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t("newsletter")}</span>
              <p className={styles.sidebarText}>{t("sidebarText")}</p>
              <Link href="/subscribe" className={styles.sidebarCta}>{t("subscribeFree")}</Link>
            </div>
            <AdUnit variant="rectangle" />
            <AdUnit variant="halfpage" />
          </aside>
        </div>

        <div className={styles.postArticleAd}>
          <AdUnit variant="leaderboard" />
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeading}>
              <h2 className={styles.relatedTitle}>{t("relatedNews")}</h2>
              <div className={styles.relatedRule} />
            </div>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.id} href={`/article/${r.id}`} className={styles.relatedCard}>
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
                    {r.excerpt && <p className={styles.relatedExcerpt}>{r.excerpt}</p>}
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedAuthor}>{r.author}</span>
                      <span className={styles.relatedDot} />
                      <span>{r.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className={styles.billboardAd}>
          <AdUnit variant="billboard" />
        </div>
      </main>

      <Footer />
    </>
  );
}

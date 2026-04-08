import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import ArticleCard from "@/app/_components/ArticleCard";
import SectionHeading from "@/app/_components/SectionHeading";
import TrendingSidebar from "@/app/_components/TrendingSidebar";
import FeaturedPanel from "@/app/_components/FeaturedPanel";
import LatestFeed from "@/app/_components/LatestFeed";
import EditorsPick from "@/app/_components/EditorsPick";
import CategoryLists from "@/app/_components/CategoryLists";
import ThreeColSection from "@/app/_components/ThreeColSection";
import Footer from "@/app/_components/Footer";
import AdSlot from "@/app/_components/AdSlot";
import {
  featuredArticle,
  secondaryFeatured,
  latestNews,
  editorsPicks,
  gridArticles,
  businessArticles,
  techArticles,
  opinionArticles,
} from "@/app/_data/articles";
import { localizeArticle, localizeArticles, getBreakingHeadline } from "@/app/_data/localize";
import styles from "@/app/page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: `${t("name")} — ${t("tagline")}`,
    description: t("description"),
    alternates: { languages: { en: "/en", ne: "/ne" } },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const featured = localizeArticle(featuredArticle, locale);
  const secondary = localizeArticles(secondaryFeatured, locale);
  const latest = localizeArticles(latestNews, locale);
  const picks = localizeArticles(editorsPicks, locale);
  const grid = localizeArticles(gridArticles, locale);
  const business = localizeArticles(businessArticles, locale);
  const tech = localizeArticles(techArticles, locale);
  const opinion = localizeArticles(opinionArticles, locale);

  const categoryColumns = [
    { label: tNav("business"), articles: business.slice(0, 5) },
    { label: tNav("technology"), articles: tech.slice(0, 5) },
    { label: t("aroundTheWorld"), articles: grid.slice(0, 5) },
  ];

  const headline = getBreakingHeadline(locale);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <main className={styles.main}>
        {/* Featured panel */}
        <section className={styles.section}>
          <FeaturedPanel primary={featured} secondary={secondary} />
        </section>

        {/* Ad 1 — Leaderboard after hero */}
        <div className={styles.adSection}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* Latest feed */}
        <section className={styles.section}>
          <LatestFeed articles={latest} />
        </section>

        {/* Ad 2 — Leaderboard after latest */}
        <div className={styles.adSection}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* Editor's Pick */}
        <section className={styles.section}>
          <EditorsPick articles={picks} />
        </section>

        {/* Top Stories + Trending sidebar */}
        <section className={styles.storiesSection}>
          <div className={styles.storiesMain}>
            <SectionHeading title={t("topStories")} />
            <div className={styles.articleGrid}>
              {grid.map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
          </div>
          <div className={styles.storiesSide}>
            <TrendingSidebar />
          </div>
        </section>

        {/* Ad 3 — Leaderboard after Top Stories */}
        <div className={styles.adSection}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* Category columns */}
        <CategoryLists columns={categoryColumns} />

        {/* Ad 4 — Billboard after category columns */}
        <div className={styles.adSection}>
          <AdSlot variant="billboard" />
        </div>

        {/* Science & Technology */}
        <div className={styles.topicDivider}>
          <ThreeColSection title={t("scienceTech")} articles={tech} />
        </div>

        {/* Ad 5 — Leaderboard after Science section */}
        <div className={styles.adSection}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* Opinion */}
        <section className={styles.opinionSection}>
          <SectionHeading title={t("opinion")} />
          <div className={styles.opinionGrid}>
            {opinion.map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        </section>

        {/* Ad 6 — Leaderboard before newsletter */}
        <div className={styles.adSection}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* Newsletter */}
        <section className={styles.newsletterSection}>
          <div className={styles.newsletterInner}>
            <p className={styles.newsletterEyebrow}>{t("newsletterEyebrow")}</p>
            <h2 className={styles.newsletterTitle}>{t("newsletterTitle")}</h2>
            <p className={styles.newsletterDesc}>{t("newsletterDesc")}</p>
            <form className={styles.newsletterForm} action="#" method="post">
              <input
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                className={styles.newsletterInput}
                aria-label={t("emailPlaceholder")}
              />
              <button type="submit" className={styles.newsletterButton}>
                {t("subscribeFree")}
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

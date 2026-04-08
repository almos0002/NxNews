"use client";

import BreakingTicker from "./_components/BreakingTicker";
import Header from "./_components/Header";
import ArticleCard from "./_components/ArticleCard";
import SectionHeading from "./_components/SectionHeading";
import TrendingSidebar from "./_components/TrendingSidebar";
import FeaturedPanel from "./_components/FeaturedPanel";
import LatestFeed from "./_components/LatestFeed";
import EditorsPick from "./_components/EditorsPick";
import CategoryLists from "./_components/CategoryLists";
import ThreeColSection from "./_components/ThreeColSection";
import Footer from "./_components/Footer";
import { useT } from "./_i18n/LanguageContext";
import {
  breakingHeadline,
  featuredArticle,
  secondaryFeatured,
  latestNews,
  editorsPicks,
  gridArticles,
  businessArticles,
  techArticles,
  opinionArticles,
} from "./_data/articles";
import styles from "./page.module.css";

export default function Home() {
  const t = useT();

  const categoryColumns = [
    { label: t("nav.business"),    articles: businessArticles.slice(0, 5) },
    { label: t("nav.technology"),  articles: techArticles.slice(0, 5) },
    { label: t("sections.aroundWorld"), articles: gridArticles.slice(0, 5) },
  ];

  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />

      <main className={styles.main}>

        {/* Hero — big featured + 3 overlay secondary cards */}
        <section className={styles.section}>
          <FeaturedPanel primary={featuredArticle} secondary={secondaryFeatured} />
        </section>

        {/* Latest news live feed */}
        <section className={styles.section}>
          <LatestFeed articles={latestNews} />
        </section>

        {/* Editor's Pick dark strip */}
        <section className={styles.section}>
          <EditorsPick articles={editorsPicks} />
        </section>

        {/* Top Stories — grid cards + trending sidebar */}
        <section className={styles.storiesSection}>
          <div className={styles.storiesMain}>
            <SectionHeading title={t("sections.topStories")} />
            <div className={styles.articleGrid}>
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
          </div>
          <div className={styles.storiesSide}>
            <TrendingSidebar />
          </div>
        </section>

        {/* 3 category columns */}
        <CategoryLists columns={categoryColumns} />

        {/* Science & Technology */}
        <div className={styles.topicDivider}>
          <ThreeColSection title={t("sections.scienceTech")} articles={techArticles} />
        </div>

        {/* Opinion */}
        <section className={styles.opinionSection}>
          <SectionHeading title={t("sections.opinionTitle")} />
          <div className={styles.opinionGrid}>
            {opinionArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterInner}>
            <span className={styles.newsletterLabel}>{t("sections.newsletter")}</span>
            <h2 className={styles.newsletterTitle}>{t("newsletter.morningTitle")}</h2>
            <p className={styles.newsletterText}>{t("newsletter.morningDesc")}</p>
            <form className={styles.newsletterForm} action="#">
              <input
                type="email"
                placeholder={t("newsletter.emailPlaceholder")}
                className={styles.newsletterInput}
                aria-label="Email address"
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                {t("newsletter.morningBtn")}
              </button>
            </form>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

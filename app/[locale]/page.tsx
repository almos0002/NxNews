import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllSettings } from "@/lib/settings";
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
import VideoSection from "@/app/_components/VideoSection";
import WeatherSection from "@/app/_components/WeatherSection";
import EntertainmentSection from "@/app/_components/EntertainmentSection";
import Footer from "@/app/_components/Footer";
import AdUnit from "@/app/_components/AdUnit";
import { getPublicArticles, getFeaturedArticles, getBreakingHeadlines } from "@/lib/public";
import styles from "@/app/page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  let s: Record<string, string> = {};
  try { s = await getAllSettings() as Record<string, string>; } catch { /* use defaults */ }

  const isNe = locale === "ne";
  const siteName  = isNe ? (s.site_title_ne   || s.site_title_en   || "KumariHub") : (s.site_title_en   || "KumariHub");
  const tagline   = isNe ? (s.site_tagline_ne  || s.site_tagline_en  || "")          : (s.site_tagline_en  || "");
  const description = isNe ? (s.site_description_ne || s.site_description_en || "") : (s.site_description_en || "");

  const title = tagline ? `${siteName} — ${tagline}` : siteName;

  return {
    title,
    description,
    alternates: { languages: { en: "/en", ne: "/ne" } },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const [allArticles, featuredArticles, headlines] = await Promise.all([
    getPublicArticles(locale, { limit: 50 }),
    getFeaturedArticles(locale),
    getBreakingHeadlines(locale, 10),
  ]);

  const featuredPool = featuredArticles.length >= 1 ? featuredArticles : allArticles;
  const featured = featuredPool[0];
  const secondary = featuredPool.slice(1, 4);
  const latest = allArticles.slice(0, 8);
  const picks = allArticles.slice(2, 6);
  const grid = allArticles.slice(0, 12);

  const business = allArticles.filter(
    (a) => a.category.toLowerCase() === "business"
  );
  const tech = allArticles.filter(
    (a) => a.category.toLowerCase() === "technology"
  );
  const entertainment = allArticles.filter(
    (a) => a.category.toLowerCase() === "entertainment"
  );

  const categoryColumns = [
    { label: tNav("business"), articles: business.slice(0, 5), href: "/business" },
    { label: tNav("technology"), articles: tech.slice(0, 5), href: "/technology" },
    { label: t("aroundTheWorld"), articles: grid.slice(0, 5), href: "/search" },
  ];

  if (!featured) {
    return (
      <>
        <BreakingTicker headlines={headlines} locale={locale} />
        <Header />
        <main className={styles.main}>
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <h2>No articles published yet</h2>
            <p>Run the seed script to add content: <code>npx tsx scripts/seed.ts</code></p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <BreakingTicker headlines={headlines} locale={locale} />
      <Header />

      <main className={styles.main}>
        <section className={styles.section}>
          <FeaturedPanel primary={featured} secondary={secondary} />
        </section>

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

        <section className={styles.section}>
          <LatestFeed articles={latest} />
        </section>

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

        <section className={styles.section}>
          <EditorsPick articles={picks} />
        </section>

        <section className={styles.storiesSection}>
          <div className={styles.storiesMain}>
            <SectionHeading title={t("topStories")} href="/search" />
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

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

        <CategoryLists columns={categoryColumns} />

        <div className={styles.adSection}>
          <AdUnit variant="billboard" />
        </div>

        <div className={styles.topicDivider}>
          <ThreeColSection title={t("scienceTech")} articles={tech} href="/technology" />
        </div>

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

        <section className={styles.section}>
          <VideoSection />
        </section>

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

        <section className={styles.section}>
          <WeatherSection />
        </section>

        <section className={styles.section}>
          <EntertainmentSection articles={entertainment} />
        </section>

        <div className={styles.adSection}>
          <AdUnit variant="leaderboard" />
        </div>

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

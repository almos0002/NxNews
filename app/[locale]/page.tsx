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

  const featured = localizeArticle(featuredArticle, locale);
  const secondary = localizeArticles(secondaryFeatured, locale);
  const latest = localizeArticles(latestNews, locale);
  const picks = localizeArticles(editorsPicks, locale);
  const grid = localizeArticles(gridArticles, locale);
  const business = localizeArticles(businessArticles, locale);
  const tech = localizeArticles(techArticles, locale);
  const opinion = localizeArticles(opinionArticles, locale);

  const categoryColumns = [
    { label: "Business", articles: business.slice(0, 5) },
    { label: "Technology", articles: tech.slice(0, 5) },
    { label: "Around the World", articles: grid.slice(0, 5) },
  ];

  const headline = getBreakingHeadline(locale);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <main className={styles.main}>
        <section className={styles.section}>
          <FeaturedPanel primary={featured} secondary={secondary} />
        </section>

        <section className={styles.section}>
          <LatestFeed articles={latest} />
        </section>

        <section className={styles.section}>
          <EditorsPick articles={picks} />
        </section>

        <section className={styles.storiesSection}>
          <div className={styles.storiesMain}>
            <SectionHeading title="Top Stories" />
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

        <CategoryLists columns={categoryColumns} />

        <div className={styles.topicDivider}>
          <ThreeColSection title="Science & Technology" articles={tech} />
        </div>

        <section className={styles.opinionSection}>
          <SectionHeading title="Opinion" />
          <div className={styles.opinionGrid}>
            {opinion.map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        </section>

        <section className={styles.newsletterSection}>
          <div className={styles.newsletterInner}>
            <p className={styles.newsletterEyebrow}>Free, every morning</p>
            <h2 className={styles.newsletterTitle}>The Daily Briefing</h2>
            <p className={styles.newsletterDesc}>
              The most important stories, explained. Delivered to your inbox every morning.
            </p>
            <form className={styles.newsletterForm} action="#" method="post">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
                aria-label="Email address"
              />
              <button type="submit" className={styles.newsletterButton}>
                Subscribe free
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

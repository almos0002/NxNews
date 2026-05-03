import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync, getDefaultOgImage } from "@/lib/seo/site-url";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import ArticleCard from "@/app/_components/article/ArticleCard";
import SectionHeading from "@/app/_components/home/SectionHeading";
import TrendingSidebar from "@/app/_components/home/TrendingSidebar";
import FeaturedPanel from "@/app/_components/home/FeaturedPanel";
import LatestFeed from "@/app/_components/home/LatestFeed";
import EditorsPick from "@/app/_components/home/EditorsPick";
import CategoryLists from "@/app/_components/home/CategoryLists";
import ThreeColSection from "@/app/_components/home/ThreeColSection";
import VideoSection from "@/app/_components/home/VideoSection";
import WeatherSection from "@/app/_components/home/WeatherSection";
import EntertainmentSection from "@/app/_components/home/EntertainmentSection";
import EventPhotosSection from "@/app/_components/home/EventPhotosSection";
import Footer from "@/app/_components/layout/Footer";
import AdUnit from "@/app/_components/ads/AdUnit";
import { getPublicArticles, getFeaturedArticles, getBreakingHeadlines, getActiveLiveCount } from "@/lib/content/public";
import { Link } from "@/i18n/navigation";
import styles from "@/app/page.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  let s: Record<string, string> = {};
  try { s = await getAllSettings() as Record<string, string>; } catch { /* use defaults */ }

  const isNe = locale === "ne";
  const siteName  = isNe ? (s.site_title_ne   || s.site_title_en   || "KumariHub") : (s.site_title_en   || "KumariHub");
  const tagline   = isNe ? (s.site_tagline_ne  || s.site_tagline_en  || "")          : (s.site_tagline_en  || "");
  const fallbackDesc = isNe
    ? "नेपालको ताजा समाचार — राजनीति, खेलकुद, मनोरञ्जन, अर्थतन्त्र र थप।"
    : "Latest news from Nepal — politics, sports, entertainment, business, and more.";
  const description = isNe
    ? (s.site_description_ne || s.site_description_en || fallbackDesc)
    : (s.site_description_en || fallbackDesc);

  const title = tagline ? `${siteName} — ${tagline}` : siteName;
  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  const og = await getDefaultOgImage();
  // Article cover (logo) > shipped default OG. Always emit `images` —
  // see comment in lib/seo/site-url.ts re: page-level openGraph replacing
  // the layout's. Without this, WhatsApp shows no preview.
  const customOgImage = s.seo_og_image_url || s.logo_url || null;
  // Only stamp width/height when we know them — i.e. the shipped default.
  // Lying about dimensions of a custom logo/cover degrades preview cards.
  const ogImage = customOgImage
    ? { url: customOgImage, alt: siteName }
    : { url: og.url, width: og.width, height: og.height, alt: siteName };
  const twitterImageUrl = customOgImage || og.url;

  return {
    metadataBase: new URL(baseUrl),
    // Home page is the brand itself — bypass the layout's `%s — siteName`
    // template so we don't end up with "siteName — siteName".
    title: { absolute: title },
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ne: "/ne",
        "x-default": "/en",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}`,
      siteName: s.site_title_en || "KumariHub",
      images: [ogImage],
      locale: locale === "ne" ? "ne_NP" : "en_US",
      alternateLocale: locale === "ne" ? ["en_US"] : ["ne_NP"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImageUrl],
    },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const [allArticles, featuredArticles, headlines, liveCount] = await Promise.all([
    getPublicArticles(locale, { limit: 50 }),
    getFeaturedArticles(locale),
    getBreakingHeadlines(locale, 10),
    getActiveLiveCount(),
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
    { label: t("aroundTheWorld"), articles: grid.slice(0, 5), href: "/world" },
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

      {liveCount > 0 && (
        <div className={styles.watchLiveBar}>
          <Link href="/live" className={styles.watchLiveBtn}>
            <span className={styles.watchLiveDot} aria-hidden="true" />
            {locale === "ne" ? "सिधा प्रसारण हेर्नुहोस्" : "Watch Live"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      )}

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
            <SectionHeading title={t("topStories")} href="/latest" />
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

        <section className={styles.section}>
          <EventPhotosSection />
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

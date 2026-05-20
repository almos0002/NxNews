import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import AdUnit from "@/app/_components/ads/AdUnit";
import { getBreakingHeadline } from "@/lib/content/public";
import { pool } from "@/lib/db/db";
import { getLivePageViewCount } from "@/lib/cms/live-views";
import { getDefaultOgImage, resolveBaseUrlSync } from "@/lib/seo/site-url";
import { getAllSettings } from "@/lib/cms/settings";
import ViewTracker from "@/app/_components/article/ViewTracker";
import LiveStreamCard from "@/app/_components/live/LiveStreamCard";
import styles from "./live.module.css";

type Props = { params: Promise<{ locale: string }> };

interface LiveStream {
  id: string;
  title_en: string;
  title_ne: string | null;
  description_en: string | null;
  description_ne: string | null;
  stream_url: string;
  platform: string;
  is_active: boolean;
  display_order: number;
}

async function getActiveStreams(): Promise<LiveStream[]> {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM live_streams WHERE is_active=true ORDER BY display_order ASC, created_at DESC"
    );
    return rows;
  } catch {
    return [];
  }
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/|channel\/|@))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function isYoutubeUrl(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const [s, og] = await Promise.all([
    getAllSettings().catch(() => ({} as Record<string, string>)),
    getDefaultOgImage(),
  ]);
  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  const siteName = isNe
    ? (s.site_title_ne || s.site_title_en || "KumariHub")
    : (s.site_title_en || "KumariHub");
  const title = isNe ? "सिधा प्रसारण" : "Live";
  const description = isNe
    ? `${siteName} को सिधा प्रसारण हेर्नुहोस् — नेपाल र विश्वका ताजा घटनाहरू।`
    : `Watch ${siteName} live streams and broadcasts — breaking news and events from Nepal and beyond.`;
  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/live`,
      languages: {
        en: "/en/live",
        ne: "/ne/live",
        "x-default": "/en/live",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/live`,
      siteName,
      locale: isNe ? "ne_NP" : "en_US",
      alternateLocale: isNe ? ["en_US"] : ["ne_NP"],
      images: [{ url: og.url, width: og.width, height: og.height, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.url],
    },
  };
}

export default async function LivePage({ params }: Props) {
  const { locale } = await params;
  const [streams, headline, livePageViews] = await Promise.all([
    getActiveStreams(),
    getBreakingHeadline(locale),
    getLivePageViewCount(),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const isNe = locale === "ne";

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.liveDot} />
            {isNe ? "सिधा प्रसारण" : "Live"}
          </div>
          <h1 className={styles.heroTitle}>
            {isNe ? "सिधा प्रसारण" : "Live Broadcasts"}
          </h1>
          <p className={styles.heroDesc}>
            {isNe
              ? "हाम्रा सिधा कार्यक्रमहरू यहाँ हेर्नुहोस्"
              : "Watch our live programs, news broadcasts, and special coverage"}
          </p>
          {livePageViews > 0 && (
            <p className={styles.heroViews}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {livePageViews.toLocaleString()} {isNe ? "दृश्य" : "view"}{livePageViews !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <ViewTracker type="live" id="live-page" />

        <div className={styles.content}>
          <div className={styles.adTop}>
            <AdUnit variant="leaderboard" />
          </div>

          {streams.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>
                {isNe ? "हाल कुनै सिधा प्रसारण छैन" : "No live streams right now"}
              </h2>
              <p className={styles.emptyDesc}>
                {isNe
                  ? "कृपया पछि फेरि आउनुहोस्।"
                  : "Please check back later for upcoming live broadcasts."}
              </p>
            </div>
          ) : (
            <div className={styles.streams}>
              {streams.map((s, idx) => (
                <LiveStreamCard
                  key={s.id}
                  stream={s}
                  featured={idx === 0}
                  autoplay={idx === 0}
                  initialLocale={locale}
                />
              ))}
            </div>
          )}

          <div className={styles.adBottom}>
            <AdUnit variant="rectangle" />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

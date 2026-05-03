import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import AdUnit from "@/app/_components/ads/AdUnit";
import { getBreakingHeadline } from "@/lib/content/public";
import { pool } from "@/lib/db/db";
import { getLivePageViewCount } from "@/lib/cms/live-views";
import { getDefaultOgImage } from "@/lib/seo/site-url";
import ViewTracker from "@/app/_components/article/ViewTracker";
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
  const { getSiteName } = await import("@/lib/cms/site-name");
  const siteName = await getSiteName(locale);
  const title = isNe ? "सिधा प्रसारण" : "Live";
  const description = isNe
    ? `${siteName} को सिधा प्रसारण हेर्नुहोस् — नेपाल र विश्वका ताजा घटनाहरू।`
    : `Watch ${siteName} live streams and broadcasts — breaking news and events from Nepal and beyond.`;
  const og = await getDefaultOgImage();
  return {
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
      url: `/${locale}/live`,
      locale: isNe ? "ne_NP" : "en_US",
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
              {streams.map((s, idx) => {
                const title = isNe && s.title_ne ? s.title_ne : s.title_en;
                const desc = isNe && s.description_ne ? s.description_ne : s.description_en;
                const ytId = isYoutubeUrl(s.stream_url) ? extractYoutubeId(s.stream_url) : null;
                const isYTChannel = s.stream_url.includes("/channel/") || s.stream_url.includes("/@");

                return (
                  <div key={s.id} className={`${styles.stream} ${idx === 0 ? styles.streamFeatured : ""}`}>
                    <div className={styles.embedWrap}>
                      {ytId && !isYTChannel ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=${idx === 0 ? 1 : 0}&mute=${idx === 0 ? 1 : 0}`}
                          title={title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className={styles.embed}
                        />
                      ) : (
                        <div className={styles.linkCard}>
                          <div className={styles.linkIcon}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 00-1.766 1.778C2 8.774 2 12.004 2 12.004s0 3.23.403 4.816a2.51 2.51 0 001.766 1.778c1.567.409 7.83.402 7.83.402s6.265.007 7.831-.403a2.51 2.51 0 001.762-1.778C22 15.23 22 12 22 12s0-3.23-.407-4.797zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z"/>
                            </svg>
                          </div>
                          <p className={styles.linkDesc}>
                            {isNe ? "सिधा प्रसारण हेर्न यहाँ थिच्नुहोस्" : "Click to watch the live stream"}
                          </p>
                          <a href={s.stream_url} target="_blank" rel="noopener noreferrer" className={styles.watchBtn}>
                            {isNe ? "अहिले हेर्नुहोस्" : "Watch Now"}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className={styles.streamInfo}>
                      <div className={styles.liveBadge}>
                        <span className={styles.liveDotSm} />
                        {isNe ? "सिधा" : "LIVE"}
                      </div>
                      <h2 className={styles.streamTitle}>{title}</h2>
                      {desc && <p className={styles.streamDesc}>{desc}</p>}
                      <a href={s.stream_url} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
                        {isNe ? "नयाँ ट्याबमा खोल्नुहोस् →" : "Open in new tab →"}
                      </a>
                    </div>
                  </div>
                );
              })}
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

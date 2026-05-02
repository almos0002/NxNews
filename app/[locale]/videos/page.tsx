import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import AdUnit from "@/app/_components/ads/AdUnit";
import JsonLd from "@/app/_components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import { getPublicVideos, getBreakingHeadline } from "@/lib/content/public";
import { getAllSettings } from "@/lib/cms/settings";
import styles from "./videos.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const title = `${t("videos")} — KumariHub`;
  const description = locale === "ne"
    ? "KumariHub मा नेपाल र विश्वका समाचार भिडियोहरू हेर्नुहोस्।"
    : "Watch the latest news videos from Nepal and around the world on KumariHub.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/videos`,
      languages: {
        en: "/en/videos",
        ne: "/ne/videos",
        "x-default": "/en/videos",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/videos`,
      locale: locale === "ne" ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  const [videos, headline, settings] = await Promise.all([
    getPublicVideos(locale),
    getBreakingHeadline(locale),
    getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  const baseUrl = settings.seo_canonical_base_url?.replace(/\/$/, "") || "https://kumarihub.com";
  const itemListLd = videos.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("videos"),
    numberOfItems: videos.length,
    itemListElement: videos.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/${locale}/videos/${v.id}`,
      name: v.title,
    })),
  } : null;

  return (
    <>
      {itemListLd && <JsonLd data={itemListLd} />}
      <BreakingTicker headline={headline} />
      <Header />

      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>Videos</span>
            <h1 className={styles.heroTitle}>{t("videos")}</h1>
            <p className={styles.heroDesc}>
              Watch our latest documentaries, reports, and in-depth video journalism.
            </p>
            <p className={styles.heroCount}>{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.adTop}>
            <AdUnit variant="leaderboard" />
          </div>

          {videos.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <p>No videos published yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className={styles.card}
                >
                  <div className={styles.thumb}>
                    {video.thumbnailUrl && (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 380px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <div className={styles.overlay} />
                    <div className={styles.topRow}>
                      <span className={styles.category}>{video.category}</span>
                      {video.duration && <span className={styles.duration}>{video.duration}</span>}
                    </div>
                    <div className={styles.playWrap}>
                      <div className={styles.playBtn}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.bottom}>
                      <h2 className={styles.cardTitle}>{video.title}</h2>
                      <p className={styles.excerpt}>{video.excerpt}</p>
                      <div className={styles.meta}>
                        <span className={styles.author}>{video.author}</span>
                        <span className={styles.dot} />
                        <span>{video.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

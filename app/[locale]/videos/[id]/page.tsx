import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import AdUnit from "@/app/_components/ads/AdUnit";
import { Link } from "@/i18n/navigation";
import { getPublicVideos, getPublicVideoById, getBreakingHeadline } from "@/lib/content/public";
import { resolveBaseUrl, getDefaultOgImage } from "@/lib/seo/site-url";
import ViewTracker from "@/app/_components/article/ViewTracker";
import styles from "./video.module.css";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const video = await getPublicVideoById(id, locale);
  if (!video) return {};
  const { getSiteName } = await import("@/lib/cms/site-name");
  const siteName = await getSiteName(locale);
  const title = video.title;
  const isNe = locale === "ne";
  const description = video.excerpt
    || (isNe
      ? `${video.title} — ${siteName} मा भिडियो हेर्नुहोस्।`
      : `Watch "${video.title}" on ${siteName} — Nepal's multilingual news portal.`);
  const baseUrl = await resolveBaseUrl();
  const og = await getDefaultOgImage();
  // Prefer the video's own thumbnail; fall back to the shipped default.
  // Treat anything with a scheme (http/https) or protocol-relative (//) as
  // already absolute; otherwise prepend baseUrl. We don't know the
  // dimensions of an external thumbnail, so we omit width/height for it.
  const thumb = video.thumbnailUrl
    ? (/^(https?:)?\/\//i.test(video.thumbnailUrl)
        ? video.thumbnailUrl
        : `${baseUrl}${video.thumbnailUrl.startsWith("/") ? "" : "/"}${video.thumbnailUrl}`)
    : og.url;
  const isThumb = thumb !== og.url;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/videos/${id}`,
      languages: {
        en: `/en/videos/${id}`,
        ne: `/ne/videos/${id}`,
        "x-default": `/en/videos/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "video.other",
      url: `${baseUrl}/${locale}/videos/${id}`,
      siteName,
      locale: isNe ? "ne_NP" : "en_US",
      images: isThumb
        ? [{ url: thumb, alt: video.title }]
        : [{ url: og.url, width: og.width, height: og.height, alt: video.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [thumb],
    },
  };
}

export default async function VideoDetailPage({ params }: Props) {
  const { locale, id } = await params;

  const [video, allVideos, headline] = await Promise.all([
    getPublicVideoById(id, locale),
    getPublicVideos(locale),
    getBreakingHeadline(locale),
  ]);

  if (!video) notFound();

  const related = allVideos.filter((v) => v.id !== id).slice(0, 4);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <ViewTracker type="video" id={video.id} />

      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <main className={styles.main}>
            <div className={styles.player}>
              {video.thumbnailUrl && (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 70vw"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className={styles.playerOverlay} />
              <div className={styles.playBtn}>
                <div className={styles.playBtnCircle}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {video.duration && (
                <span className={styles.playerDuration}>{video.duration}</span>
              )}
            </div>

            <div className={styles.meta}>
              <span className={styles.category}>{video.category}</span>
              <span className={styles.date}>{video.date}</span>
            </div>

            <h1 className={styles.title}>{video.title}</h1>

            <div className={styles.byline}>
              <div className={styles.authorAvatar}>
                {video.author.charAt(0)}
              </div>
              <span className={styles.author}>{video.author}</span>
              {video.duration && (
                <>
                  <span className={styles.dot} />
                  <span className={styles.duration}>{video.duration}</span>
                </>
              )}
              {video.viewCount != null && video.viewCount > 0 && (
                <>
                  <span className={styles.dot} />
                  <span className={styles.duration} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    {video.viewCount >= 1000 ? `${(video.viewCount / 1000).toFixed(1)}k` : video.viewCount.toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <p className={styles.excerpt}>{video.excerpt}</p>

            <div className={styles.adInBody}>
              <AdUnit variant="leaderboard" />
            </div>
          </main>

          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>{t("videos")}</h2>

            <div className={styles.relatedList}>
              {related.map((v) => (
                <Link key={v.id} href={`/videos/${v.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedThumb}>
                    {v.thumbnailUrl && (
                      <Image
                        src={v.thumbnailUrl}
                        alt={v.title}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <div className={styles.relatedOverlay}>
                      <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {v.duration && (
                      <span className={styles.relatedDuration}>{v.duration}</span>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <span className={styles.relatedCategory}>{v.category}</span>
                    <h4 className={styles.relatedTitle}>{v.title}</h4>
                    <span className={styles.relatedDate}>{v.date}</span>
                  </div>
                </Link>
              ))}
            </div>

            <AdUnit variant="rectangle" />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import AdSlot from "@/app/_components/AdSlot";
import { Link } from "@/i18n/navigation";
import { videoItems } from "@/app/_data/videos";
import { getBreakingHeadline } from "@/app/_data/localize";
import { routing } from "@/i18n/routing";
import styles from "./videos.module.css";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("videos")} — KumariHub` };
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const headline = getBreakingHeadline(locale);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <div className={styles.wrapper}>
        {/* Hero banner */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>Videos</span>
            <h1 className={styles.heroTitle}>{t("videos")}</h1>
            <p className={styles.heroDesc}>
              Watch our latest documentaries, reports, and in-depth video journalism.
            </p>
            <p className={styles.heroCount}>{videoItems.length} videos</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.adTop}>
            <AdSlot variant="leaderboard" />
          </div>

          {/* Video grid */}
          <div className={styles.grid}>
            {videoItems.map((video) => (
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
                    <span className={styles.duration}>{video.duration}</span>
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
        </div>
      </div>

      <Footer />
    </>
  );
}

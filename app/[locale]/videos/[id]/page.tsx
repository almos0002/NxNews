import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import AdUnit from "@/app/_components/AdUnit";
import { Link } from "@/i18n/navigation";
import { getPublicVideos, getPublicVideoById, getBreakingHeadline } from "@/lib/public";
import styles from "./video.module.css";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const video = await getPublicVideoById(id, locale);
  if (!video) return {};
  return { title: `${video.title} — KumariHub` };
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

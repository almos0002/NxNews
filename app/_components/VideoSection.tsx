import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getPublicVideos } from "@/lib/public";
import { Link } from "@/i18n/navigation";
import styles from "./VideoSection.module.css";

export default async function VideoSection() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const videos = await getPublicVideos(locale);

  if (videos.length === 0) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("videos")}</h2>
        <div className={styles.rule} />
        <Link href="/videos" className={styles.seeAll}>{t("seeAll")}</Link>
      </div>

      <div className={styles.scrollTrack}>
        {videos.map((video) => (
          <Link key={video.id} href={`/videos/${video.id}`} className={styles.card}>
            {video.thumbnailUrl && (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                sizes="320px"
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
              <h4 className={styles.cardTitle}>{video.title}</h4>
              <p className={styles.excerpt}>{video.excerpt}</p>
              <div className={styles.meta}>
                <span className={styles.author}>{video.author}</span>
                <span className={styles.dot} />
                <span>{video.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

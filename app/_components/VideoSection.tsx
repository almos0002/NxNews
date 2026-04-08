import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { videoItems } from "@/app/_data/videos";
import styles from "./VideoSection.module.css";

export default async function VideoSection() {
  const t = await getTranslations("home");

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("videos")}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.scrollTrack}>
        {videoItems.map((video) => (
          <div key={video.id} className={styles.card}>
            {/* Background image */}
            {video.thumbnailUrl && (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                sizes="320px"
                style={{ objectFit: "cover" }}
              />
            )}

            {/* Full gradient overlay */}
            <div className={styles.overlay} />

            {/* Top row: category + duration */}
            <div className={styles.topRow}>
              <span className={styles.category}>{video.category}</span>
              <span className={styles.duration}>{video.duration}</span>
            </div>

            {/* Centred play button */}
            <div className={styles.playWrap}>
              <div className={styles.playBtn}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Bottom text */}
            <div className={styles.bottom}>
              <h4 className={styles.cardTitle}>{video.title}</h4>
              <p className={styles.excerpt}>{video.excerpt}</p>
              <div className={styles.meta}>
                <span className={styles.author}>{video.author}</span>
                <span className={styles.dot} />
                <span>{video.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

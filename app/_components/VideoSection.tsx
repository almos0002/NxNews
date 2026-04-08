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
            <div className={styles.thumb}>
              {video.thumbnailUrl && (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className={styles.overlay}>
                <div className={styles.playBtn}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className={styles.duration}>{video.duration}</span>
              </div>
            </div>
            <div className={styles.info}>
              <span className={styles.category}>{video.category}</span>
              <h4 className={styles.cardTitle}>{video.title}</h4>
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

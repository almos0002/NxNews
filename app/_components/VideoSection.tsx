import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { videoItems } from "@/app/_data/videos";
import styles from "./VideoSection.module.css";

export default async function VideoSection() {
  const t = await getTranslations("home");
  const featured = videoItems[0];
  const rest = videoItems.slice(1);

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("videos")}</h2>
        <div className={styles.rule} />
        <span className={styles.seeAll}>{t("seeAll")}</span>
      </div>

      <div className={styles.grid}>
        {/* Featured video — large */}
        {featured && (
          <div className={styles.featured}>
            <div className={styles.thumb}>
              {featured.thumbnailUrl && (
                <Image
                  src={featured.thumbnailUrl}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className={styles.overlay}>
                <div className={styles.playBtn}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className={styles.duration}>{featured.duration}</span>
              </div>
            </div>
            <div className={styles.info}>
              <span className={styles.category}>{featured.category}</span>
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              <p className={styles.excerpt}>{featured.excerpt}</p>
              <div className={styles.meta}>
                <span className={styles.author}>{featured.author}</span>
                <span className={styles.dot} />
                <span>{featured.date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Smaller video cards */}
        <div className={styles.list}>
          {rest.map((video) => (
            <div key={video.id} className={styles.card}>
              <div className={styles.cardThumb}>
                {video.thumbnailUrl && (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 40vw, 15vw"
                    style={{ objectFit: "cover" }}
                  />
                )}
                <div className={styles.cardOverlay}>
                  <div className={styles.cardPlay}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className={styles.cardDuration}>{video.duration}</span>
                </div>
              </div>
              <div className={styles.cardInfo}>
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
      </div>
    </section>
  );
}

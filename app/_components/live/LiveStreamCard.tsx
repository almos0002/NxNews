"use client";

import { useState } from "react";
import styles from "./LiveStreamCard.module.css";

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

interface Props {
  stream: LiveStream;
  featured?: boolean;
  autoplay?: boolean;
  initialLocale: string;
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

export default function LiveStreamCard({ stream: s, featured, autoplay, initialLocale }: Props) {
  const hasNepali = !!(s.title_ne || s.description_ne);
  const [lang, setLang] = useState<"en" | "ne">(initialLocale === "ne" && hasNepali ? "ne" : "en");

  const title = lang === "ne" && s.title_ne ? s.title_ne : s.title_en;
  const desc = lang === "ne" && s.description_ne ? s.description_ne : s.description_en;

  const ytId = isYoutubeUrl(s.stream_url) ? extractYoutubeId(s.stream_url) : null;
  const isYTChannel = s.stream_url.includes("/channel/") || s.stream_url.includes("/@");

  return (
    <div className={`${styles.stream} ${featured ? styles.streamFeatured : ""}`}>
      <div className={styles.embedWrap}>
        {ytId && !isYTChannel ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoplay ? 1 : 0}&mute=${autoplay ? 1 : 0}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.embed}
          />
        ) : (
          <div className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 00-1.766 1.778C2 8.774 2 12.004 2 12.004s0 3.23.403 4.816a2.51 2.51 0 001.766 1.778c1.567.409 7.83.402 7.83.402s6.265.007 7.831-.403a2.51 2.51 0 001.762-1.778C22 15.23 22 12 22 12s0-3.23-.407-4.797zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z" />
              </svg>
            </div>
            <p className={styles.linkDesc}>
              {lang === "ne" ? "सिधा प्रसारण हेर्न यहाँ थिच्नुहोस्" : "Click to watch the live stream"}
            </p>
            <a href={s.stream_url} target="_blank" rel="noopener noreferrer" className={styles.watchBtn}>
              {lang === "ne" ? "अहिले हेर्नुहोस्" : "Watch Now"}
            </a>
          </div>
        )}
      </div>

      <div className={styles.streamInfo}>
        <div className={styles.infoTop}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDotSm} />
            {lang === "ne" ? "सिधा" : "LIVE"}
          </div>

          {hasNepali && (
            <div className={styles.langToggle} role="group" aria-label="Language">
              <button
                className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`${styles.langBtn} ${lang === "ne" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("ne")}
                type="button"
              >
                नेपाली
              </button>
            </div>
          )}
        </div>

        <h2 key={`title-${lang}`} className={`${styles.streamTitle} ${lang === "ne" ? styles.devanagari : ""}`}>
          {title}
        </h2>

        {desc && (
          <p key={`desc-${lang}`} className={`${styles.streamDesc} ${lang === "ne" ? styles.devanagari : ""}`}>
            {desc}
          </p>
        )}

        {!desc && lang === "ne" && s.description_en && (
          <p className={styles.noTranslation}>
            <span>No Nepali description — </span>
            <button
              type="button"
              className={styles.showEnBtn}
              onClick={() => setLang("en")}
            >
              view in English
            </button>
          </p>
        )}

        <a href={s.stream_url} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
          {lang === "ne" ? "नयाँ ट्याबमा खोल्नुहोस् →" : "Open in new tab →"}
        </a>
      </div>
    </div>
  );
}

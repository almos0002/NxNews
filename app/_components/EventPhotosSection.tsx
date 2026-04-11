import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listEventPhotos } from "@/lib/events";
import styles from "./EventPhotosSection.module.css";

export default async function EventPhotosSection() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("home"),
  ]);

  const events = await listEventPhotos({ limit: 6, status: "published" });
  if (events.length === 0) return null;

  const isNe = locale === "ne";

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {isNe ? "फोटो ग्यालेरी" : "Photo Gallery"}
          </span>
          <h2 className={styles.title}>{isNe ? "कार्यक्रम फोटोहरू" : "Event Photos"}</h2>
        </div>
        <Link href="/events" className={styles.viewAll}>
          {isNe ? "सबै हेर्नुहोस्" : t("seeAll")} →
        </Link>
      </div>

      <div className={styles.grid}>
        {events.map((ev, idx) => {
          const title = isNe && ev.title_ne ? ev.title_ne : ev.title_en;
          const location = isNe && ev.location_ne ? ev.location_ne : ev.location_en;
          return (
            <Link key={ev.id} href={`/events/${ev.slug}`} className={`${styles.card} ${idx === 0 ? styles.cardFeatured : ""}`}>
              <div className={styles.cardImage}>
                {ev.cover_image ? (
                  <Image
                    src={ev.cover_image}
                    alt={title}
                    fill
                    sizes={idx === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                <div className={styles.cardOverlay} />
                {ev.images.length > 0 && (
                  <span className={styles.photoBadge}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {ev.images.length}
                  </span>
                )}
                <div className={styles.cardContent}>
                  {ev.event_date && (
                    <span className={styles.cardDate}>
                      {new Date(ev.event_date).toLocaleDateString(isNe ? "ne-NP" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  <h3 className={styles.cardTitle}>{title}</h3>
                  {location && (
                    <span className={styles.cardLocation}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {location}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

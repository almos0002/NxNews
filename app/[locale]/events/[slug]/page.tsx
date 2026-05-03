import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import { Link } from "@/i18n/navigation";
import AdUnit from "@/app/_components/ads/AdUnit";
import ViewTracker from "@/app/_components/article/ViewTracker";
import JsonLd from "@/app/_components/seo/JsonLd";
import { getEventPhotoBySlug, listEventPhotos } from "@/lib/cms/events";
import { getBreakingHeadline } from "@/lib/content/public";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrl, resolveBaseUrlSync, OG_DEFAULT_IMAGE } from "@/lib/seo/site-url";
import styles from "./gallery.module.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventPhotoBySlug(slug);
  if (!event) return { title: "Not Found" };

  const baseUrl = await resolveBaseUrl();
  const isNe = locale === "ne";
  const title = isNe && event.title_ne ? event.title_ne : event.title_en;
  const description = (isNe ? event.description_ne : event.description_en) || title;
  // Always provide an og:image, even when the event has no cover, so social
  // platforms (WhatsApp / Slack / Twitter) can still render a link preview.
  const ogImageUrl = event.cover_image || `${baseUrl}${OG_DEFAULT_IMAGE.path}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/events/${slug}`,
      languages: {
        en: `/en/events/${slug}`,
        ne: `/ne/events/${slug}`,
        "x-default": `/en/events/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/events/${slug}`,
      locale: isNe ? "ne_NP" : "en_US",
      images: [{ url: ogImageUrl, width: OG_DEFAULT_IMAGE.width, height: OG_DEFAULT_IMAGE.height, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function EventGalleryPage({ params }: Props) {
  const { locale, slug } = await params;
  const isNe = locale === "ne";

  const [event, related, headline, settings] = await Promise.all([
    getEventPhotoBySlug(slug),
    listEventPhotos({ limit: 4, status: "published" }),
    getBreakingHeadline(locale),
    getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  if (!event) notFound();

  const title = isNe && event.title_ne ? event.title_ne : event.title_en;
  const description = isNe ? event.description_ne : event.description_en;
  const location = isNe && event.location_ne ? event.location_ne : event.location_en;

  const relatedEvents = related.filter((r) => r.id !== event.id).slice(0, 3);

  // Absolute URLs in JSON-LD play best with Schema.org validators / Google
  // Rich Results — relative URLs require the parser to know the page origin.
  const baseUrl = resolveBaseUrlSync(settings.seo_canonical_base_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: title,
    description: description ?? undefined,
    url: `${baseUrl}/${locale}/events/${slug}`,
    datePublished: event.event_date ?? event.created_at,
    image: event.images.slice(0, 10).map((img) => ({
      "@type": "ImageObject",
      url: img.url,
      caption: (isNe ? img.caption_ne : img.caption_en) ?? undefined,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isNe ? "गृहपृष्ठ" : "Home", item: `${baseUrl}/${locale}` },
      { "@type": "ListItem", position: 2, name: isNe ? "कार्यक्रम फोटो" : "Event Photos", item: `${baseUrl}/${locale}/events` },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbLd]} />
      <BreakingTicker headline={headline} />
      <Header />

      <div className={styles.wrapper}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>{isNe ? "गृहपृष्ठ" : "Home"}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/events" className={styles.breadcrumbLink}>{isNe ? "कार्यक्रम फोटो" : "Event Photos"}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{title}</span>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          {event.cover_image && (
            <div className={styles.heroCover}>
              <Image src={event.cover_image} alt={title} fill priority sizes="(max-width: 768px) 100vw, 900px" style={{ objectFit: "cover" }} />
              <div className={styles.heroCoverOverlay} />
            </div>
          )}
          <div className={event.cover_image ? styles.heroBodyOverCover : styles.heroBody}>
            <p className={styles.heroBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {isNe ? "फोटो ग्यालेरी" : "Photo Gallery"} &bull; {event.images.length} {isNe ? "फोटो" : "photo"}{event.images.length !== 1 ? "s" : ""}
            </p>
            <h1 className={styles.heroTitle}>{title}</h1>
            <div className={styles.heroMeta}>
              {event.event_date && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(event.event_date).toLocaleDateString(isNe ? "ne-NP" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {location && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {location}
                </span>
              )}
              {event.view_count > 0 && (
                <span className={styles.metaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {event.view_count.toLocaleString()} {isNe ? "दृश्य" : "view"}{event.view_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {description && <p className={styles.heroDesc}>{description}</p>}
          </div>
        </div>

        <ViewTracker type="event" id={event.id} />

        <div className={styles.adTop}>
          <AdUnit variant="leaderboard" />
        </div>

        {/* Gallery grid */}
        {event.images.length === 0 ? (
          <div className={styles.empty}>
            <p>{isNe ? "यस कार्यक्रमका लागि फोटोहरू उपलब्ध छैनन्।" : "No photos available for this event yet."}</p>
          </div>
        ) : (
          <div className={styles.gallery}>
            {event.images.map((img, idx) => {
              const caption = isNe && img.caption_ne ? img.caption_ne : img.caption_en;
              return (
                <figure key={idx} className={`${styles.galleryItem} ${idx === 0 ? styles.galleryItemFeatured : ""}`}>
                  <div className={styles.galleryImageWrap}>
                    <Image
                      src={img.url}
                      alt={caption ?? `${title} — photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 400px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        )}

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{isNe ? "अन्य कार्यक्रमहरू" : "More Events"}</h2>
            <div className={styles.relatedGrid}>
              {relatedEvents.map((ev) => {
                const evTitle = isNe && ev.title_ne ? ev.title_ne : ev.title_en;
                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} className={styles.relatedCard}>
                    <div className={styles.relatedImage}>
                      {ev.cover_image ? (
                        <Image src={ev.cover_image} alt={evTitle} fill sizes="200px" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className={styles.relatedPlaceholder}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </div>
                    <p className={styles.relatedCardTitle}>{evTitle}</p>
                  </Link>
                );
              })}
            </div>
            <Link href="/events" className={styles.viewAllLink}>
              {isNe ? "सबै कार्यक्रम हेर्नुहोस् →" : "View all events →"}
            </Link>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

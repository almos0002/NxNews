import type { Metadata } from "next";
import Image from "next/image";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import PaginationBar from "@/app/_components/article/PaginationBar";
import JsonLd from "@/app/_components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import { listEventPhotos, countEventPhotos } from "@/lib/cms/events";
import { getBreakingHeadline } from "@/lib/content/public";
import { getAllSettings } from "@/lib/cms/settings";
import styles from "./events.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const title = isNe ? "कार्यक्रम फोटोहरू — KumariHub" : "Event Photos — KumariHub";
  const description = isNe
    ? "KumariHub द्वारा कभर गरिएका कार्यक्रम र समारोहका फोटो ग्यालेरीहरू।"
    : "Photo galleries from events and occasions covered by KumariHub.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/events`,
      languages: {
        en: "/en/events",
        ne: "/ne/events",
        "x-default": "/en/events",
      },
    },
    openGraph: { title, description, type: "website", url: `/${locale}/events`, locale: isNe ? "ne_NP" : "en_US" },
    twitter: { card: "summary", title, description },
  };
}

const PAGE_SIZE = 24;

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const isNe = locale === "ne";

  const [events, total, headline, settings] = await Promise.all([
    listEventPhotos({ limit: PAGE_SIZE, offset, status: "published" }),
    countEventPhotos({ status: "published" }),
    getBreakingHeadline(locale),
    getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const baseUrl = settings.seo_canonical_base_url?.replace(/\/$/, "") || "https://kumarihub.com";
  const itemListLd = events.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isNe ? "कार्यक्रम फोटो" : "Event Photos",
    numberOfItems: events.length,
    itemListElement: events.map((ev, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: `${baseUrl}/${locale}/events/${ev.slug}`,
      name: (isNe && ev.title_ne) ? ev.title_ne : ev.title_en,
    })),
  } : null;

  return (
    <>
      {itemListLd && <JsonLd data={itemListLd} />}
      <BreakingTicker headline={headline} />
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <p className={styles.heroEyebrow}>{isNe ? "फोटो ग्यालेरी" : "Photo Gallery"}</p>
          <h1 className={styles.heroTitle}>{isNe ? "कार्यक्रम फोटोहरू" : "Event Photos"}</h1>
          <p className={styles.heroDesc}>
            {isNe
              ? "KumariHub द्वारा कभर गरिएका कार्यक्रम र समारोहका फोटोहरू हेर्नुहोस्।"
              : "Browse photo galleries from events and occasions covered by our team."}
          </p>
        </div>

        {events.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>{isNe ? "कुनै फोटो उपलब्ध छैन" : "No event photos yet"}</h2>
            <p>{isNe ? "कृपया पछि फेरि आउनुहोस्।" : "Check back soon for photo galleries."}</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {events.map((ev) => {
                const title = isNe && ev.title_ne ? ev.title_ne : ev.title_en;
                const location = isNe && ev.location_ne ? ev.location_ne : ev.location_en;
                return (
                  <Link key={ev.id} href={`/events/${ev.slug}`} className={styles.card}>
                    <div className={styles.cardImage}>
                      {ev.cover_image ? (
                        <Image src={ev.cover_image} alt={title} fill sizes="(max-width:680px) 50vw, 300px" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className={styles.cardPlaceholder}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      {ev.images.length > 0 && (
                        <span className={styles.photoBadge}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          {ev.images.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{title}</h2>
                      <div className={styles.cardMeta}>
                        {ev.event_date && (
                          <span className={styles.cardDate}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {new Date(ev.event_date).toLocaleDateString(isNe ? "ne-NP" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {location && (
                          <span className={styles.cardLocation}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ marginTop: 40 }}>
              <PaginationBar page={page} totalPages={totalPages} />
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

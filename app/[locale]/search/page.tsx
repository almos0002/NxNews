import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import ArchiveLayout from "@/app/_components/article/ArchiveLayout";
import PaginationBar from "@/app/_components/article/PaginationBar";
import SearchInput from "@/app/_components/article/SearchInput";
import {
  searchPublicArticles,
  countSearchArticles,
  getPublicTags,
  getBreakingHeadline,
  PUBLIC_PAGE_SIZE,
} from "@/lib/content/public";
import { Link } from "@/i18n/navigation";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { getSiteName } = await import("@/lib/cms/site-name");
  const siteName = await getSiteName(locale);
  const title = locale === "ne" ? "खोज्नुहोस्" : "Search";
  return {
    title,
    description: locale === "ne"
      ? `${siteName} मा समाचार, लेख र विषयहरू खोज्नुहोस्।`
      : `Search news articles, topics and more on ${siteName}.`,
    robots: { index: false, follow: false },
  };
}

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function LocaleSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const offset = (page - 1) * PUBLIC_PAGE_SIZE;

  const [results, total, tags, headline] = await Promise.all([
    query ? searchPublicArticles(query, locale, { limit: PUBLIC_PAGE_SIZE, offset }) : Promise.resolve([]),
    query ? countSearchArticles(query) : Promise.resolve(0),
    getPublicTags(locale),
    getBreakingHeadline(locale),
  ]);

  const t = await getTranslations("search");
  const totalPages = Math.ceil(total / PUBLIC_PAGE_SIZE);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>{t("badge")}</span>
          <h1 className={styles.title}>
            {query ? t("resultsFor", { query }) : t("findAnyStory")}
          </h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <SearchInput defaultValue={query} />
        </div>
      </div>

      {query ? (
        <ArchiveLayout
          badge={t("badge")}
          title={`"${query}"`}
          description={total === 0 ? t("noResults") : undefined}
          count={total}
          articles={results}
          paginationSlot={
            <PaginationBar
              page={page}
              totalPages={totalPages}
              params={query ? { q: query } : {}}
            />
          }
        />
      ) : (
        <div className={styles.browse}>
          <div className={styles.browseInner}>
            <h2 className={styles.browseTitle}>{t("byTopic")}</h2>
            <div className={styles.tagGrid}>
              {tags.map((tag) => (
                <Link key={tag.slug} href={`/tags/${tag.slug}`} className={styles.tagPill}>
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

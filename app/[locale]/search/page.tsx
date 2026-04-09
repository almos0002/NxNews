import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import SearchInput from "@/app/_components/SearchInput";
import {
  searchPublicArticles,
  getPublicTags,
  getBreakingHeadline,
} from "@/lib/public";
import { Link } from "@/i18n/navigation";
import styles from "@/app/search/page.module.css";

export const metadata: Metadata = {
  title: "Search — KumariHub",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function LocaleSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [results, tags, headline] = await Promise.all([
    query ? searchPublicArticles(query, locale) : Promise.resolve([]),
    getPublicTags(),
    getBreakingHeadline(locale),
  ]);

  const t = await getTranslations("search");

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
          description={results.length === 0 ? t("noResults") : undefined}
          count={results.length}
          articles={results}
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

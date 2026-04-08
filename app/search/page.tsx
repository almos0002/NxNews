import type { Metadata } from "next";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import SearchInput from "@/app/_components/SearchInput";
import { searchArticles } from "@/app/_data/getAllArticles";
import { tags } from "@/app/_data/tags";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Search | The Daily Report",
  description: "Search articles, topics, and authors across The Daily Report.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = searchArticles(query);

  return (
    <>
      <BreakingTicker />
      <Header />

      {/* Search hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>Search</span>
          <h1 className={styles.title}>
            {query ? `Results for "${query}"` : "Find any story"}
          </h1>
          <p className={styles.subtitle}>
            Search across all articles, topics, categories, and authors.
          </p>
          <SearchInput defaultValue={query} />
        </div>
      </div>

      {query ? (
        <ArchiveLayout
          badge="Search Results"
          title={`"${query}"`}
          description={results.length > 0 ? undefined : "Try a different keyword or browse our topics below."}
          count={results.length}
          articles={results}
        />
      ) : (
        /* No query — show topic browse */
        <div className={styles.browse}>
          <div className={styles.browseInner}>
            <h2 className={styles.browseTitle}>Browse by topic</h2>
            <div className={styles.tagGrid}>
              {tags.map((t) => (
                <a key={t.slug} href={`/tags/${t.slug}`} className={styles.tagPill}>
                  {t.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

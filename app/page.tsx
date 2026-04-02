import BreakingTicker from "./_components/BreakingTicker";
import Header from "./_components/Header";
import ArticleCard from "./_components/ArticleCard";
import SectionHeading from "./_components/SectionHeading";
import TrendingSidebar from "./_components/TrendingSidebar";
import FeaturedPanel from "./_components/FeaturedPanel";
import LatestFeed from "./_components/LatestFeed";
import EditorsPick from "./_components/EditorsPick";
import SplitPanel from "./_components/SplitPanel";
import ThreeColSection from "./_components/ThreeColSection";
import Footer from "./_components/Footer";
import {
  breakingHeadline,
  featuredArticle,
  secondaryFeatured,
  latestNews,
  editorsPicks,
  gridArticles,
  businessArticles,
  techArticles,
  opinionArticles,
} from "./_data/articles";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />

      <main className={styles.main}>

        {/* Hero — big featured + 3 overlay secondary cards */}
        <section className={styles.section}>
          <FeaturedPanel primary={featuredArticle} secondary={secondaryFeatured} />
        </section>

        {/* Latest news live feed */}
        <section className={styles.section}>
          <LatestFeed articles={latestNews} />
        </section>

        {/* Editor's Pick dark strip */}
        <section className={styles.section}>
          <EditorsPick articles={editorsPicks} />
        </section>

        {/* Top Stories — grid cards + trending sidebar (unchanged) */}
        <section className={styles.storiesSection}>
          <div className={styles.storiesMain}>
            <SectionHeading title="Top Stories" />
            <div className={styles.articleGrid}>
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
          </div>
          <div className={styles.storiesSide}>
            <TrendingSidebar />
          </div>
        </section>

        {/* Business & Markets — 2-col: lead + text items | thumbnail rows */}
        <div className={styles.topicDivider}>
          <SplitPanel title="Business & Markets" articles={businessArticles} />
        </div>

        {/* Science & Technology — 3-col: image card | thumb rows | headlines */}
        <div className={styles.topicDivider}>
          <ThreeColSection title="Science & Technology" articles={techArticles} />
        </div>

        {/* Opinion — 3-column compact */}
        <section className={styles.opinionSection}>
          <SectionHeading title="Opinion" />
          <div className={styles.opinionGrid}>
            {opinionArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterInner}>
            <span className={styles.newsletterLabel}>Newsletter</span>
            <h2 className={styles.newsletterTitle}>The Morning Briefing</h2>
            <p className={styles.newsletterText}>
              Start every day informed. Our editors curate the most important
              stories delivered to your inbox before 7 AM.
            </p>
            <form className={styles.newsletterForm} action="#">
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
                aria-label="Email address"
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                Subscribe
              </button>
            </form>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

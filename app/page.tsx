import BreakingTicker from "./_components/BreakingTicker";
import Header from "./_components/Header";
import ArticleCard from "./_components/ArticleCard";
import SectionHeading from "./_components/SectionHeading";
import TrendingSidebar from "./_components/TrendingSidebar";
import Footer from "./_components/Footer";
import {
  breakingHeadline,
  featuredArticle,
  sidebarArticles,
  gridArticles,
  opinionArticles,
} from "./_data/articles";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <ArticleCard article={featuredArticle} variant="hero" />
        </section>

        <section className={styles.latestSection}>
          <SectionHeading title="Latest" />
          <div className={styles.latestGrid}>
            {sidebarArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="sidebar"
              />
            ))}
          </div>
        </section>

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

        <section className={styles.opinionSection}>
          <SectionHeading title="Opinion" />
          <div className={styles.opinionGrid}>
            {opinionArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
              />
            ))}
          </div>
        </section>

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

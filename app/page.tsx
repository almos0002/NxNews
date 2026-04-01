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
          <div className={styles.heroLeft}>
            <ArticleCard article={featuredArticle} variant="hero" />
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroRightHeading}>
              <SectionHeading title="Latest" />
            </div>
            {sidebarArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="sidebar"
              />
            ))}
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.gridMain}>
            <SectionHeading title="Top Stories" />
            <div className={styles.articleGrid}>
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
          </div>
          <div className={styles.gridSide}>
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
            <div className={styles.newsletterContent}>
              <h2 className={styles.newsletterTitle}>The Morning Briefing</h2>
              <p className={styles.newsletterText}>
                Start every day informed. Our editors curate the most important
                stories delivered straight to your inbox before 7 AM.
              </p>
            </div>
            <form className={styles.newsletterForm} action="#" onSubmit={undefined}>
              <input
                type="email"
                placeholder="Your email address"
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

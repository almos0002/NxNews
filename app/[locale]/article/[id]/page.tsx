import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CategoryBadge from "@/app/_components/CategoryBadge";
import AdSlot from "@/app/_components/AdSlot";
import { getAllArticles, getArticleById, getRelatedArticles } from "@/app/_data/getAllArticles";
import { localizeArticle, localizeArticles, getBreakingHeadline } from "@/app/_data/localize";
import { bodyParagraphsNe } from "@/app/_data/articlesNe";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "@/app/article/[id]/page.module.css";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllArticles().map((a) => ({ locale, id: a.id }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const article = getArticleById(id);
  if (!article) return {};
  const loc = localizeArticle(article, locale);
  return {
    title: `${loc.title} — The Daily Report`,
    description: loc.excerpt,
    alternates: { languages: { en: `/en/article/${id}`, ne: `/ne/article/${id}` } },
  };
}

const bodyParagraphsEn: Record<string, string[]> = {
  World: [
    "Across the globe, the convergence of climate pressures, shifting demographics, and technological disruption is forcing governments and civil societies to rethink longstanding assumptions. What once seemed like distant policy debates have become immediate questions of survival and adaptation.",
    "Experts who have tracked these trends for decades say the speed of change is unprecedented. 'We are compressing what should be a century of transition into a single generation,' said one senior policy researcher who asked not to be named. 'That creates enormous stress on institutions that were not designed for this pace.'",
    "At the community level, the effects are already tangible. Local officials describe scrambling to allocate resources, navigate competing demands, and maintain public trust in institutions under strain. The gap between stated policy and lived experience remains a persistent fault line.",
    "International coordination, long the cornerstone of multilateral governance, faces its own crisis of legitimacy. Multilateral forums have proliferated even as their capacity to produce binding agreements has atrophied.",
    "Still, there are reasons to believe that adaptation is possible. History offers examples of societies that successfully navigated profound dislocations — not without pain, but with enough collective ingenuity to emerge on stable footing.",
    "What seems clear is that the decisions made over the next five to ten years will constrain — or expand — the possibilities available to future generations. The stakes, as many observers note, could scarcely be higher.",
  ],
  Politics: [
    "The political calculus behind this development has been building for years, driven by a confluence of electoral pressures, institutional fatigue, and a media environment that rewards confrontation over compromise.",
    "'What we are seeing is the logical endpoint of a process that began long before most people were paying attention,' said one former senior official. 'The incentives have been misaligned for a long time.'",
    "Behind closed doors, lawmakers from both sides of the aisle acknowledge the dysfunction even as they perpetuate it. Procedural manoeuvres that once served as last resorts have become routine.",
    "The broader public, according to polling data reviewed by The Daily Report, has grown increasingly cynical. Trust in representative institutions has fallen to levels not recorded since the mid-1970s.",
    "Reform advocates argue that structural changes — ranked-choice voting, independent redistricting, campaign finance limits — could alter incentives meaningfully.",
    "For now, the immediate focus remains on the political developments unfolding in real time. Decisions made in the coming weeks will signal whether the system retains the capacity for course correction.",
  ],
  Business: [
    "The economic forces at play here reflect a longer restructuring that has been reshaping industries, labour markets, and capital flows for more than a decade.",
    "Corporate strategists have responded with a mixture of aggressive repositioning and cautious hedging. 'Everyone is trying to read signals that are genuinely ambiguous,' said one senior executive.",
    "Supply chain vulnerabilities, exposed dramatically during the pandemic, remain only partially addressed. Reshoring and near-shoring initiatives have advanced, but the costs involved have proven higher.",
    "Consumer behaviour has shifted in ways that confound traditional models. Spending patterns, savings rates, and debt tolerance all look different from pre-pandemic baselines.",
    "Regulators and policymakers are navigating their own uncertainty. The tools available to them were calibrated for a different economic environment.",
    "For businesses, the challenge is to make long-term strategic decisions in an environment where the medium-term outlook is genuinely unclear.",
  ],
  Technology: [
    "The technology sector continues to evolve at a pace that outstrips the capacity of regulatory frameworks to keep up. Decisions made in research labs and boardrooms today will shape what is possible — and what is permissible — for decades.",
    "Engineers and ethicists inside major technology companies describe a culture in which competitive pressure often overrides caution. 'There is always someone willing to move faster,' said one senior researcher.",
    "The gap between what these systems can do and what the public understands about them remains vast. Surveys consistently show that most people significantly underestimate both the capabilities and the limitations of artificial intelligence.",
    "Governments are beginning to engage more seriously. Legislative proposals have been introduced in multiple jurisdictions, though the speed of technological change makes it genuinely difficult to write rules that will remain relevant.",
    "The workforce implications are already being felt. Certain categories of knowledge work — translation, coding, content generation — are being transformed more rapidly than economists had projected.",
    "What happens next depends partly on technical developments that are not yet knowable, and partly on social and political choices that are still being made.",
  ],
  Science: [
    "The findings represent years of painstaking research conducted by teams spanning multiple institutions and continents. The methodology has been subject to rigorous peer review, and independent researchers have confirmed the core results.",
    "'This changes the way we understand the fundamental mechanism,' said one of the principal investigators. 'We will need to revise models that have been in use for decades.'",
    "The practical implications are significant, though the timeline for real-world application remains uncertain. Translating a scientific breakthrough into a deployable technology is rarely straightforward.",
    "Funding constraints remain a persistent challenge for basic research. While governments and private philanthropists have increased their contributions in recent years, the gap between scientific ambition and available resources remains wide.",
    "Younger researchers entering the field describe a landscape that is both exhilarating and precarious. Competition for grants and positions is intense.",
    "The broader scientific community has responded with cautious optimism. Several leading researchers described the study as a significant advance.",
  ],
  Culture: [
    "The work arrives at a moment of cultural ferment, when questions of representation, authenticity, and the relationship between art and commerce feel newly urgent.",
    "Critics who attended early viewings describe it as a work that refuses easy categorisation — formally adventurous, emotionally demanding, and deliberately resistant to frictionless consumption.",
    "'I was not interested in making something comfortable,' the creator has said in interviews. 'Comfort is the enemy of encounter.'",
    "The cultural conversation around the work has itself become part of the work's meaning. Online discussions have excavated references and debated interpretations.",
    "Commercial considerations inevitably shape what gets made and what gets distributed. The economics of cultural production have shifted dramatically.",
    "What endures, if anything endures, is not for any of us to determine right now. The work is out in the world. It will have to find its own way.",
  ],
  Opinion: [
    "The argument being advanced here is not new, but its urgency is. We have known for some time that the path we are on leads somewhere we would not choose to go — and yet we have continued down it.",
    "There is a version of this story in which individuals and institutions rise to the challenge, find common ground, and make the difficult decisions that the situation requires.",
    "But there is another version, equally available in the historical record, in which the window for effective action closes gradually, then suddenly — and the reckoning, when it comes, is far more painful than the course correction would have been.",
    "The question is not whether we understand the stakes. We do. The question is whether that understanding is sufficient to produce the will, the coordination, and the sacrifice that the situation demands.",
    "I am not, by temperament, a pessimist. But I am also not willing to pretend that the situation is less serious than it is.",
    "What would it look like to take this seriously? Not in words — we are not short of words — but in decisions, in trade-offs, in the reallocation of attention and resources toward the things that actually matter.",
  ],
  Sports: [
    "The performance confirmed what those close to the preparation had long suspected: that a combination of tactical innovation and individual brilliance had produced something genuinely unusual.",
    "Opponents and analysts who have studied the footage closely describe a coherence that is rare at this level — a collective understanding of space, timing, and risk.",
    "'You can see it in the small details,' said one experienced observer. 'The decisions being made in fractions of a second, consistently, under pressure. That's not accidental.'",
    "The broader context matters too. The institutional investment that made this possible did not arrive overnight. Years of infrastructure development, talent identification, and coaching education preceded this moment.",
    "Questions about the future are inevitable. Sustaining performance at this level requires constant renewal — of personnel, of ideas, of motivation.",
    "For now, though, the focus is on what has been achieved. Whatever comes next, this chapter will be worth remembering.",
  ],
};

function getBodyParagraphs(category: string, locale: string): string[] {
  if (locale === "ne") {
    return bodyParagraphsNe[category] ?? bodyParagraphsNe["World"];
  }
  return bodyParagraphsEn[category] ?? bodyParagraphsEn["World"];
}

export default async function ArticlePage({ params }: Props) {
  const { id, locale } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  const loc = localizeArticle(article, locale);
  const related = localizeArticles(getRelatedArticles(article, 4), locale);
  const body = getBodyParagraphs(article.category, locale);
  const t = await getTranslations("article");
  const headline = getBreakingHeadline(locale);

  // Split body into three chunks for in-article ads
  const third = Math.ceil(body.length / 3);
  const chunk1 = body.slice(0, third);
  const chunk2 = body.slice(third, third * 2);
  const chunk3 = body.slice(third * 2);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />

      <main className={styles.main}>
        {/* ── Article header ── */}
        <div className={styles.articleHeader}>
          <div className={styles.categoryRow}>
            <CategoryBadge category={article.category} />
          </div>
          <h1 className={styles.title}>{loc.title}</h1>
          {loc.excerpt && <p className={styles.excerpt}>{loc.excerpt}</p>}
          <div className={styles.meta}>
            <span className={styles.author}>{t("by")} {article.author}</span>
            <span className={styles.metaDot} />
            <span>{article.date}</span>
            {article.time && (
              <>
                <span className={styles.metaDot} />
                <span>{article.time}</span>
              </>
            )}
            <span className={styles.metaDot} />
            <span>{article.readTime} {t("minRead")}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.actionBtn} aria-label="Share on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t("share")}
            </button>
            <button className={styles.actionBtn} aria-label="Share on LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t("share")}
            </button>
            <button className={styles.actionBtn} aria-label="Copy link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {t("copyLink")}
            </button>
          </div>
        </div>

        {/* ── Pre-content leaderboard ── */}
        <div className={styles.inArticleAd}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* ── Hero image ── */}
        {article.imageUrl && (
          <div className={styles.heroImage}>
            <Image src={article.imageUrl} alt={loc.title} fill
              sizes="(max-width: 860px) 100vw, 860px" priority style={{ objectFit: "cover" }} />
          </div>
        )}

        {/* ── Body + sidebar ── */}
        <div className={styles.layout}>
          <article className={styles.body}>
            {/* Chunk 1 */}
            {chunk1.map((para, i) => (
              <p key={`c1-${i}`} className={styles.para}>{para}</p>
            ))}

            {/* In-article ad 1 */}
            <div className={styles.inBodyAd}>
              <AdSlot variant="leaderboard" />
            </div>

            {/* Pull quote */}
            <div className={styles.pullQuote}>
              <blockquote className={styles.quote}>{loc.excerpt || body[1]}</blockquote>
            </div>

            {/* Chunk 2 */}
            {chunk2.map((para, i) => (
              <p key={`c2-${i}`} className={styles.para}>{para}</p>
            ))}

            {/* In-article ad 2 */}
            <div className={styles.inBodyAd}>
              <AdSlot variant="leaderboard" />
            </div>

            {/* Chunk 3 */}
            {chunk3.map((para, i) => (
              <p key={`c3-${i}`} className={styles.para}>{para}</p>
            ))}

            <div className={styles.tagRow}>
              <span className={styles.tagLabel}>{t("topics")}</span>
              <span className={styles.tag}>{article.category}</span>
              <span className={styles.tag}>The Daily Report</span>
            </div>
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t("aboutAuthor")}</span>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className={styles.authorName}>{article.author}</p>
                  <p className={styles.authorRole}>{article.category} {t("correspondent")}</p>
                </div>
              </div>
            </div>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t("newsletter")}</span>
              <p className={styles.sidebarText}>{t("sidebarText")}</p>
              <Link href="/subscribe" className={styles.sidebarCta}>{t("subscribeFree")}</Link>
            </div>
            <AdSlot variant="rectangle" />
            <AdSlot variant="halfpage" />
          </aside>
        </div>

        {/* ── Post-article leaderboard ── */}
        <div className={styles.postArticleAd}>
          <AdSlot variant="leaderboard" />
        </div>

        {/* ── Related articles ── */}
        {related.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeading}>
              <h2 className={styles.relatedTitle}>{t("relatedNews")}</h2>
              <div className={styles.relatedRule} />
            </div>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.id} href={`/article/${r.id}`} className={styles.relatedCard}>
                  {r.imageUrl && (
                    <div className={styles.relatedImage}>
                      <Image src={r.imageUrl} alt={r.title} fill
                        sizes="(max-width: 600px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className={styles.relatedBody}>
                    <CategoryBadge category={r.category} />
                    <h3 className={styles.relatedCardTitle}>{r.title}</h3>
                    {r.excerpt && <p className={styles.relatedExcerpt}>{r.excerpt}</p>}
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedAuthor}>{r.author}</span>
                      <span className={styles.relatedDot} />
                      <span>{r.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Post-related billboard ── */}
        <div className={styles.billboardAd}>
          <AdSlot variant="billboard" />
        </div>
      </main>

      <Footer />
    </>
  );
}

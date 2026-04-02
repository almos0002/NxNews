import Image from "next/image";
import { notFound } from "next/navigation";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CategoryBadge from "@/app/_components/CategoryBadge";
import { getAllArticles, getArticleById, getRelatedArticles } from "@/app/_data/getAllArticles";
import { breakingHeadline } from "@/app/_data/articles";
import type { Metadata } from "next";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) return {};
  return {
    title: `${article.title} — The Daily Report`,
    description: article.excerpt,
  };
}

const mockBodyParagraphs: Record<string, string[]> = {
  World: [
    "Across the globe, the convergence of climate pressures, shifting demographics, and technological disruption is forcing governments and civil societies to rethink longstanding assumptions. What once seemed like distant policy debates have become immediate questions of survival and adaptation.",
    "Experts who have tracked these trends for decades say the speed of change is unprecedented. 'We are compressing what should be a century of transition into a single generation,' said one senior policy researcher who asked not to be named. 'That creates enormous stress on institutions that were not designed for this pace.'",
    "At the community level, the effects are already tangible. Local officials describe scrambling to allocate resources, navigate competing demands, and maintain public trust in institutions under strain. The gap between stated policy and lived experience remains a persistent fault line.",
    "International coordination, long the cornerstone of multilateral governance, faces its own crisis of legitimacy. Multilateral forums have proliferated even as their capacity to produce binding agreements has atrophied. Analysts point to structural incentives that favour short-term national interest over collective long-term benefit.",
    "Still, there are reasons to believe that adaptation is possible. History offers examples of societies that successfully navigated profound dislocations — not without pain, but with enough collective ingenuity to emerge on stable footing. The question is whether contemporary institutions are capable of channelling that same ingenuity at scale.",
    "What seems clear is that the decisions made over the next five to ten years will constrain — or expand — the possibilities available to future generations. The stakes, as many observers note, could scarcely be higher.",
  ],
  Politics: [
    "The political calculus behind this development has been building for years, driven by a confluence of electoral pressures, institutional fatigue, and a media environment that rewards confrontation over compromise. Analysts who monitor legislative behaviour say the pattern is now deeply entrenched.",
    "'What we are seeing is the logical endpoint of a process that began long before most people were paying attention,' said one former senior official who worked across multiple administrations. 'The incentives have been misaligned for a long time.'",
    "Behind closed doors, lawmakers from both sides of the aisle acknowledge the dysfunction even as they perpetuate it. Procedural manoeuvres that once served as last resorts have become routine. Norms that provided guardrails for generations have been tested to breaking point.",
    "The broader public, according to polling data reviewed by The Daily Report, has grown increasingly cynical. Trust in representative institutions has fallen to levels not recorded since the mid-1970s. Turnout figures tell a complicated story — high in some jurisdictions, depressed in others — but the underlying sentiment of alienation is consistent.",
    "Reform advocates argue that structural changes — ranked-choice voting, independent redistricting, campaign finance limits — could alter incentives meaningfully. Opponents counter that such changes are either impractical or likely to produce unintended consequences of their own.",
    "For now, the immediate focus remains on the political developments unfolding in real time. Decisions made in the coming weeks will signal whether the system retains the capacity for course correction — or whether the impasse is now structural.",
  ],
  Business: [
    "The economic forces at play here reflect a longer restructuring that has been reshaping industries, labour markets, and capital flows for more than a decade. What is new is the pace at which these forces are now interacting — and the limited room for error that remains.",
    "Corporate strategists have responded with a mixture of aggressive repositioning and cautious hedging. 'Everyone is trying to read signals that are genuinely ambiguous,' said one senior executive at a major financial institution. 'The models we have relied on for years are producing outputs that don't match what we observe on the ground.'",
    "Supply chain vulnerabilities, exposed dramatically during the pandemic, remain only partially addressed. Reshoring and near-shoring initiatives have advanced, but the costs involved have proven higher and the timelines longer than initially projected. The result is a hybrid configuration that satisfies no one fully.",
    "Meanwhile, the appetite for capital investment remains constrained by interest rate uncertainty and a regulatory environment that is evolving faster than many compliance functions can track. Deal activity, while recovering from the lows of 2023 and 2024, has not returned to the levels that many had anticipated.",
    "Labour market dynamics add another layer of complexity. Tight conditions in skilled sectors coexist with structural unemployment in others, creating mismatches that training programmes have struggled to bridge in the near term.",
    "Despite these headwinds, pockets of genuine dynamism remain. Sectors tied to energy transition, artificial intelligence infrastructure, and healthcare innovation continue to attract substantial commitment. Whether those sectors can sustain broader economic momentum is the central question for the quarters ahead.",
  ],
  Technology: [
    "The technological developments at the frontier of this field are advancing faster than regulatory frameworks, public understanding, or in many cases the organisations deploying them can adequately track. The result is a landscape of enormous possibility shadowed by genuine uncertainty.",
    "'We have moved from theoretical capability to operational deployment in a matter of months,' noted one researcher at a leading institute. 'The governance conversation has not kept pace, and that gap creates real risk — not hypothetical risk.'",
    "The companies at the centre of this transformation are navigating their own internal tensions. Engineering teams pushing the limits of what is technically possible increasingly find themselves in dialogue — sometimes confrontation — with policy, legal, and ethics functions that are trying to anticipate downstream consequences.",
    "Regulatory bodies on multiple continents have signalled intent to act, but the specifics remain contested. Industry stakeholders argue that overly prescriptive rules will stifle innovation before its benefits have been realised. Critics counter that the costs of waiting for harm to materialise before acting are too high.",
    "For end users, the experience is one of rapid change with uneven distribution of benefit. Access to the most capable systems remains stratified by geography, income, and institutional affiliation — a pattern that advocates argue must be addressed if the technology is to serve broadly inclusive ends.",
    "The trajectory over the next three to five years will likely be shaped less by technical limitation than by the choices societies make about governance, access, and accountability. Those choices are still very much open — which is both an opportunity and a responsibility.",
  ],
  Science: [
    "The scientific findings at the centre of this story emerge from years of painstaking work by researchers across multiple disciplines and institutions. The collaboration required to produce results at this scale is itself a kind of achievement — one that is easy to overlook in the focus on the headline discovery.",
    "'Good science is almost always slower than we would like and faster than most people realise,' said one of the principal investigators involved in the work. 'What looks like a breakthrough to the outside is usually the culmination of a hundred small steps, most of which failed in instructive ways.'",
    "The methodology employed here represented a departure from standard practice in several respects. New instrumentation, novel analytical frameworks, and — critically — a willingness to follow data that challenged existing models all played a role. Peer review, while rigorous, was expedited given the potential implications.",
    "Independent experts who have reviewed the findings describe them as credible and significant, while urging caution about over-interpreting early results. 'The finding is real,' said one who was not involved in the research. 'What it means in practice will take time to work out.'",
    "Replication is the next critical step. Several teams around the world have indicated their intention to attempt to reproduce the core results using different approaches and datasets. The scientific community will be watching closely.",
    "If the findings hold up to scrutiny, the implications extend well beyond the immediate field of study. Funding bodies, clinical practitioners, and in some cases policymakers will need to reckon with what the results mean for current practice. That process, by its nature, will be neither quick nor linear.",
  ],
  Culture: [
    "What this story reveals about contemporary culture is something that has been taking shape quietly for years — a realignment of values, aesthetics, and social expectations that is now visible enough to be named, even if it is still too close to be fully understood.",
    "'There are moments when the culture turns,' observed one cultural critic who has been tracking these shifts. 'Usually we only recognise them in retrospect. This time, I think we can see it happening in real time — which is disorienting, but also interesting.'",
    "The commercial dimensions are not incidental. Industries built on older cultural assumptions are finding their foundations shifting in ways that spreadsheets cannot fully capture. The responses range from genuine reinvention to strategic mimicry — and audiences, generally, can tell the difference.",
    "Creators working at the intersection of tradition and innovation describe a productive tension. The constraints imposed by existing forms push against the possibilities opened by new tools and distribution channels. Some of the most compelling work of the past decade has emerged from that friction.",
    "Younger audiences bring expectations shaped by an information environment their predecessors could not have imagined. Authenticity, participation, and alignment with articulated values matter in ways that older models of cultural consumption did not anticipate. Brands and institutions are still adjusting.",
    "The longer arc of these shifts will only become clear with distance. For now, the experience for most people is one of navigating rapid change with reference points that are themselves in motion — a condition that is generative for some, disorienting for others, and defining for all.",
  ],
  Opinion: [
    "The argument advanced here is not a comfortable one, and it is not intended to be. Comfort, in the face of the evidence now before us, would be a form of intellectual evasion. What the moment demands is clarity — and a willingness to follow the logic wherever it leads.",
    "Those who disagree will have objections. Some are serious and deserve engagement; others are reflexive defences of positions that events have overtaken. The task of distinguishing between them is part of what honest public argument requires.",
    "The evidence on which this analysis rests is, as always, imperfect. Data are incomplete, models are approximations, and reasonable people can weigh the same facts differently. But the weight of available evidence points in a consistent direction, and the cost of ignoring it grows with each passing season.",
    "Critics of this position sometimes argue that the alternative they prefer carries fewer risks. That argument deserves scrutiny. Risk is not eliminated by declining to act; it is redistributed — often toward those with the fewest resources to bear it.",
    "What would change my mind? That is a question every honest commentator should be able to answer. I would revise this view in the face of sustained, peer-reviewed evidence that the mechanisms I have described do not operate as I believe they do. I have not seen that evidence.",
    "The stakes here are not abstract. They are measured in lived experience — in the choices available to real people navigating circumstances they did not choose. That is the standard against which policy and argument must ultimately be judged.",
  ],
  Sports: [
    "What unfolded here was more than a result. It was a demonstration of what sustained investment in preparation, tactical intelligence, and collective commitment can produce under pressure — the kind of performance that teams and coaches spend careers working toward.",
    "'You can plan for everything and still be surprised,' said one of the key figures involved. 'What you hope is that your preparation is good enough that the surprises don't become disasters. Today, we were fortunate.'",
    "The broader context matters. The competitive environment in this sport has shifted significantly over the past five years, with changes in talent development, coaching philosophy, and physical preparation all contributing to a landscape that rewards adaptability as much as raw ability.",
    "For the fans who witnessed it, the experience was one of those rare occasions when the gap between expectation and outcome — in either direction — produces something genuinely memorable. The atmosphere, by multiple accounts, was extraordinary.",
    "For the losers, the aftermath will involve the difficult work of honest assessment. Some of what happened was within their control; some was not. Distinguishing between the two is part of how elite competitors learn and improve.",
    "The season is far from over, and the implications of today's result will play out over many weeks. But what is already clear is that this performance has established a reference point — a standard against which future efforts will be measured.",
  ],
};

function getBodyParagraphs(category: string): string[] {
  return (
    mockBodyParagraphs[category] ??
    mockBodyParagraphs["World"]
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) notFound();

  const related = getRelatedArticles(article, 3);
  const body = getBodyParagraphs(article.category);

  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />

      <main className={styles.main}>

        {/* Article header */}
        <div className={styles.articleHeader}>
          <div className={styles.categoryRow}>
            <CategoryBadge category={article.category} />
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && (
            <p className={styles.excerpt}>{article.excerpt}</p>
          )}
          <div className={styles.meta}>
            <span className={styles.author}>By {article.author}</span>
            <span className={styles.metaDot} />
            <span>{article.date}</span>
            {article.time && (
              <>
                <span className={styles.metaDot} />
                <span>{article.time}</span>
              </>
            )}
            <span className={styles.metaDot} />
            <span>{article.readTime} read</span>
          </div>

          {/* Share row */}
          <div className={styles.actions}>
            <button className={styles.actionBtn} aria-label="Share on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share
            </button>
            <button className={styles.actionBtn} aria-label="Share on LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share
            </button>
            <button className={styles.actionBtn} aria-label="Copy link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Copy link
            </button>
          </div>
        </div>

        {/* Hero image */}
        {article.imageUrl && (
          <div className={styles.heroImage}>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 860px) 100vw, 860px"
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        {/* Article body + sidebar */}
        <div className={styles.layout}>
          <article className={styles.body}>
            {body.map((para, i) => (
              <p key={i} className={styles.para}>{para}</p>
            ))}

            <div className={styles.pullQuote}>
              <blockquote className={styles.quote}>
                {article.excerpt || body[1]}
              </blockquote>
            </div>

            {body.slice(Math.ceil(body.length / 2)).map((para, i) => (
              <p key={`b${i}`} className={styles.para}>{para}</p>
            ))}

            <div className={styles.tagRow}>
              <span className={styles.tagLabel}>Topics:</span>
              <span className={styles.tag}>{article.category}</span>
              <span className={styles.tag}>The Daily Report</span>
            </div>
          </article>

          {/* Sticky sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>About the author</span>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>
                  {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className={styles.authorName}>{article.author}</p>
                  <p className={styles.authorRole}>{article.category} Correspondent</p>
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>Newsletter</span>
              <p className={styles.sidebarText}>Get the best of The Daily Report in your inbox every morning.</p>
              <a href="/subscribe" className={styles.sidebarCta}>Subscribe free</a>
            </div>
          </aside>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeading}>
              <h2 className={styles.relatedTitle}>More to Read</h2>
              <div className={styles.relatedRule} />
            </div>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <a key={r.id} href={`/article/${r.id}`} className={styles.relatedCard}>
                  {r.imageUrl && (
                    <div className={styles.relatedImage}>
                      <Image
                        src={r.imageUrl}
                        alt={r.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={styles.relatedBody}>
                    <CategoryBadge category={r.category} />
                    <h3 className={styles.relatedCardTitle}>{r.title}</h3>
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedAuthor}>{r.author}</span>
                      <span className={styles.relatedDot} />
                      <span>{r.readTime}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  );
}

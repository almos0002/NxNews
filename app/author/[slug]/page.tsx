import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { authors, getAuthorBySlug, nameToSlug } from "@/app/_data/authors";
import { getAllArticles, getArticlesByAuthor } from "@/app/_data/getAllArticles";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articleAuthorSlugs = Array.from(
    new Set(getAllArticles().map((a) => nameToSlug(a.author)))
  ).map((slug) => ({ slug }));
  const profileSlugs = authors.map((a) => ({ slug: a.slug }));
  const all = new Map<string, { slug: string }>();
  [...profileSlugs, ...articleAuthorSlugs].forEach((s) => all.set(s.slug, s));
  return Array.from(all.values());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = getAuthorBySlug(slug);
  const name = profile?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} | The Daily Report`,
    description: profile?.bio ?? `Articles by ${name} on The Daily Report.`,
  };
}

function AuthorProfile({
  name,
  role,
  bio,
  articleCount,
  twitter,
  linkedin,
}: {
  name: string;
  role: string;
  bio: string;
  articleCount: number;
  twitter?: string;
  linkedin?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={styles.profile}>
      <div className={styles.avatar} aria-hidden="true">
        {initials}
      </div>
      <div className={styles.profileInfo}>
        <p className={styles.profileRole}>{role}</p>
        <h2 className={styles.profileName}>{name}</h2>
        <p className={styles.profileBio}>{bio}</p>
        <div className={styles.profileMeta}>
          <span className={styles.articleCount}>
            {articleCount} article{articleCount !== 1 ? "s" : ""}
          </span>
          {twitter && (
            <a
              href={`https://twitter.com/${twitter.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={`${name} on X (Twitter)`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {twitter}
            </a>
          )}
          {linkedin && (
            <a
              href={`https://linkedin.com/in/${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={`${name} on LinkedIn`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const profile = getAuthorBySlug(slug);

  const authorName = (() => {
    if (profile) return profile.name;
    const all = getAllArticles();
    return all.find((a) => nameToSlug(a.author) === slug)?.author ?? null;
  })();

  if (!authorName) notFound();

  const articles = getArticlesByAuthor(authorName);

  return (
    <>
      <BreakingTicker />
      <Header />
      <ArchiveLayout
        badgeKey="archive.journalist"
        title={authorName}
        count={articles.length}
        articles={articles}
        profileSlot={
          <AuthorProfile
            name={authorName}
            role={profile?.role ?? "Contributor"}
            bio={
              profile?.bio ??
              `${authorName} is a contributor to The Daily Report, covering breaking news, analysis, and in-depth features across a range of topics.`
            }
            articleCount={articles.length}
            twitter={profile?.twitter}
            linkedin={profile?.linkedin}
          />
        }
      />
      <Footer />
    </>
  );
}

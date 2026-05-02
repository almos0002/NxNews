import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import ArchiveLayout from "@/app/_components/article/ArchiveLayout";
import PaginationBar from "@/app/_components/article/PaginationBar";
import {
  getPublicArticlesByTag,
  countPublicArticlesByTag,
  getPublicTags,
  getBreakingHeadline,
  PUBLIC_PAGE_SIZE,
} from "@/lib/content/public";

type Props = {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, locale } = await params;
  const tags = await getPublicTags();
  const tagData = tags.find((t) => t.slug === tag);
  const label = tagData?.label ?? tag.replace(/-/g, " ");
  const title = `${label} — KumariHub`;
  const description = tagData?.description || `Articles tagged with "${label}" on KumariHub.`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/tags/${tag}`,
      languages: { en: `/en/tags/${tag}`, ne: `/ne/tags/${tag}` },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/tags/${tag}`,
      locale: locale === "ne" ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag, locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PUBLIC_PAGE_SIZE;

  const [tags, articles, total, headline] = await Promise.all([
    getPublicTags(),
    getPublicArticlesByTag(tag, locale, { limit: PUBLIC_PAGE_SIZE, offset }),
    countPublicArticlesByTag(tag),
    getBreakingHeadline(locale),
  ]);

  const tagData = tags.find((t) => t.slug === tag);
  if (!tagData && total === 0) notFound();

  const t = await getTranslations("archive");
  const label = tagData?.label ?? tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const totalPages = Math.ceil(total / PUBLIC_PAGE_SIZE);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <ArchiveLayout
        badge={t("topicBadge")}
        title={label}
        description={tagData?.description}
        count={total}
        articles={articles}
        paginationSlot={
          <PaginationBar page={page} totalPages={totalPages} />
        }
      />
      <Footer />
    </>
  );
}

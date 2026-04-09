import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import {
  getPublicArticlesByTag,
  getPublicTags,
  getBreakingHeadline,
} from "@/lib/public";

type Props = { params: Promise<{ locale: string; tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const tags = await getPublicTags();
  const tagData = tags.find((t) => t.slug === tag);
  const label = tagData?.label ?? tag.replace(/-/g, " ");
  return {
    title: `${label} — KumariHub`,
    description: tagData?.description,
    alternates: { languages: { en: `/en/tags/${tag}`, ne: `/ne/tags/${tag}` } },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag, locale } = await params;

  const [tags, articles, headline] = await Promise.all([
    getPublicTags(),
    getPublicArticlesByTag(tag, locale),
    getBreakingHeadline(locale),
  ]);

  const tagData = tags.find((t) => t.slug === tag);
  if (!tagData && articles.length === 0) notFound();

  const t = await getTranslations("archive");
  const label = tagData?.label ?? tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <ArchiveLayout
        badge={t("topicBadge")}
        title={label}
        description={tagData?.description}
        count={articles.length}
        articles={articles}
      />
      <Footer />
    </>
  );
}

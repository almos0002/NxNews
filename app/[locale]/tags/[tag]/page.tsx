import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { tags, getTagBySlug } from "@/app/_data/tags";
import { getArticlesByTag } from "@/app/_data/getAllArticles";
import { localizeArticles, getBreakingHeadline } from "@/app/_data/localize";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; tag: string }> };

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    tags.map((t) => ({ locale, tag: t.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const tagData = getTagBySlug(tag);
  const label = tagData?.label ?? tag.replace(/-/g, " ");
  return {
    title: `${label} — The Daily Report`,
    description: tagData?.description,
    alternates: { languages: { en: `/en/tags/${tag}`, ne: `/ne/tags/${tag}` } },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag, locale } = await params;
  const tagData = getTagBySlug(tag);
  if (!tagData) notFound();

  const t = await getTranslations("archive");
  const rawArticles = getArticlesByTag(tag);
  const articles = localizeArticles(rawArticles, locale);
  const headline = getBreakingHeadline(locale);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <ArchiveLayout
        badge={t("topicBadge")}
        title={tagData.label}
        description={tagData.description}
        count={articles.length}
        articles={articles}
      />
      <Footer />
    </>
  );
}

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
import { getDefaultOgImage, resolveBaseUrlSync } from "@/lib/seo/site-url";
import { getAllSettings } from "@/lib/cms/settings";

export const revalidate = 120;

type Props = {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, locale } = await params;
  const isNe = locale === "ne";
  const [tags, s, og] = await Promise.all([
    getPublicTags(locale),
    getAllSettings().catch(() => ({} as Record<string, string>)),
    getDefaultOgImage(),
  ]);
  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  const siteName = isNe
    ? (s.site_title_ne || s.site_title_en || "KumariHub")
    : (s.site_title_en || "KumariHub");
  const tagData = tags.find((t) => t.slug === tag);
  const label = tagData?.label ?? tag.replace(/-/g, " ");
  const title = label;
  const description = isNe
    ? (tagData?.description || `"${label}" ट्यागका लेखहरू ${siteName} मा पढ्नुहोस्।`)
    : (tagData?.description || `Articles tagged with "${label}" on ${siteName}.`);
  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/tags/${tag}`,
      languages: {
        en: `/en/tags/${tag}`,
        ne: `/ne/tags/${tag}`,
        "x-default": `/en/tags/${tag}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/tags/${tag}`,
      siteName,
      locale: isNe ? "ne_NP" : "en_US",
      alternateLocale: isNe ? ["en_US"] : ["ne_NP"],
      images: [{ url: og.url, width: og.width, height: og.height, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.url],
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag, locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PUBLIC_PAGE_SIZE;

  const [tags, articles, total, headline] = await Promise.all([
    getPublicTags(locale),
    getPublicArticlesByTag(tag, locale, { limit: PUBLIC_PAGE_SIZE, offset }),
    countPublicArticlesByTag(tag),
    getBreakingHeadline(locale),
  ]);

  const tagData = tags.find((t) => t.slug === tag);
  // The admin Taxonomy page is the single source of truth: only render a
  // tag page if the slug exists in the tags table, regardless of whether
  // any articles still have the string in their `tags` column.
  if (!tagData) notFound();

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

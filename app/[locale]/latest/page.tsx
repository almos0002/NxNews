import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import ArchiveLayout from "@/app/_components/article/ArchiveLayout";
import PaginationBar from "@/app/_components/article/PaginationBar";
import JsonLd from "@/app/_components/seo/JsonLd";
import {
  getPublicArticles,
  countPublicArticles,
  getBreakingHeadline,
  PUBLIC_PAGE_SIZE,
} from "@/lib/content/public";
import { getAllSettings } from "@/lib/cms/settings";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const title = isNe ? "ताजा समाचार — KumariHub" : "Latest News — KumariHub";
  const description = isNe
    ? "KumariHub का सबैभन्दा ताजा र नयाँ समाचारहरू।"
    : "The most recent stories from KumariHub — updated continuously.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/latest`,
      languages: {
        en: "/en/latest",
        ne: "/ne/latest",
        "x-default": "/en/latest",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/latest`,
      locale: isNe ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function LatestPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PUBLIC_PAGE_SIZE;

  const t = await getTranslations({ locale, namespace: "archive" });
  const isNe = locale === "ne";

  const [articles, total, headline, settings] = await Promise.all([
    getPublicArticles(locale, { limit: PUBLIC_PAGE_SIZE, offset }),
    countPublicArticles(),
    getBreakingHeadline(locale),
    getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  const totalPages = Math.ceil(total / PUBLIC_PAGE_SIZE);

  const baseUrl = settings.seo_canonical_base_url?.replace(/\/$/, "") || "https://kumarihub.com";
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isNe ? "ताजा समाचारहरू" : "Latest News",
    numberOfItems: articles.length,
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PUBLIC_PAGE_SIZE + i + 1,
      url: `${baseUrl}/${locale}/article/${a.id}`,
      name: a.title,
    })),
  };

  return (
    <>
      <JsonLd data={itemListLd} />
      <BreakingTicker headline={headline} />
      <Header />
      <ArchiveLayout
        badge={isNe ? "ताजा समाचार" : "Latest"}
        title={isNe ? "ताजा समाचारहरू" : "Latest News"}
        description={
          isNe
            ? "KumariHub का सबैभन्दा ताजा र नयाँ समाचारहरू — निरन्तर अद्यावधिक।"
            : "The most recent stories from KumariHub — updated continuously."
        }
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

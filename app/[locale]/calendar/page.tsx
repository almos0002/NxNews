import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import CalendarClient from "@/app/_components/article/CalendarClient";
import { getBreakingHeadline } from "@/lib/content/public";
import { getDefaultOgImage, resolveBaseUrlSync } from "@/lib/seo/site-url";
import { getAllSettings } from "@/lib/cms/settings";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const [s, og] = await Promise.all([
    getAllSettings().catch(() => ({} as Record<string, string>)),
    getDefaultOgImage(),
  ]);
  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  const siteName = isNe
    ? (s.site_title_ne || s.site_title_en || "KumariHub")
    : (s.site_title_en || "KumariHub");
  const title = isNe ? "पात्रो" : "Calendar (AD & BS)";
  const description = isNe
    ? "नेपाली बिक्रम संवत र अंग्रेजी ग्रेगोरियन पात्रो। मिति रूपान्तरण र आजको तिथि।"
    : "View the Bikram Sambat (BS) and Gregorian (AD) calendar with date conversion. Today's date in both systems.";
  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/calendar`,
      languages: {
        en: "/en/calendar",
        ne: "/ne/calendar",
        "x-default": "/en/calendar",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/calendar`,
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

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  const [headline] = await Promise.all([
    getBreakingHeadline(locale),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <main style={{ minHeight: "70vh" }}>
        <CalendarClient locale={locale} />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import CalendarClient from "@/app/_components/article/CalendarClient";
import { getBreakingHeadline } from "@/lib/content/public";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const title = isNe ? "पात्रो — KumariHub" : "Calendar (AD & BS) — KumariHub";
  const description = isNe
    ? "नेपाली बिक्रम संवत र अंग्रेजी ग्रेगोरियन पात्रो। मिति रूपान्तरण र आजको तिथि।"
    : "View the Bikram Sambat (BS) and Gregorian (AD) calendar with date conversion. Today's date in both systems.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/calendar`,
      languages: { en: "/en/calendar", ne: "/ne/calendar" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/calendar`,
      locale: isNe ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
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

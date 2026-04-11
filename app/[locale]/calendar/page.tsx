import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CalendarClient from "@/app/_components/CalendarClient";
import { getBreakingHeadline } from "@/lib/public";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ne"
      ? "पात्रो — KumariHub"
      : "Calendar (AD & BS) — KumariHub",
    description: locale === "ne"
      ? "नेपाली बिक्रम संवत र अंग्रेजी ग्रेगोरियन पात्रो"
      : "View the Bikram Sambat (BS) and Gregorian (AD) calendar with date conversion.",
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

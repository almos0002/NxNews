import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import { getBreakingHeadline } from "@/lib/content/public";
import LoginForm from "@/app/_components/auth/LoginForm";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const title = isNe ? "साइन इन — KumariHub" : "Sign In — KumariHub";
  return {
    title,
    // Auth pages have no public content worth indexing and create
    // duplicate / thin content signals if crawled.
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: `/${locale}/login` },
  };
}

export default async function LocaleLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const t = await getTranslations("login");
  const { from } = await searchParams;
  const { locale } = await params;
  const breakingHeadline = (await getBreakingHeadline(locale)) ?? "";

  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>{t("title")}</h1>
            <p className={styles.subheading}>{t("subtitle")}</p>
          </div>
          <LoginForm from={from ?? "/dashboard"} />
        </div>
      </main>
      <Footer />
    </>
  );
}

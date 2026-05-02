import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/layout/BreakingTicker";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import { getBreakingHeadline } from "@/lib/content/public";
import SignupForm from "@/app/_components/auth/SignupForm";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isNe = locale === "ne";
  const title = isNe ? "खाता बनाउनुहोस् — KumariHub" : "Create Account — KumariHub";
  return {
    title,
    // Sign-up screens are gated user flows — keep them out of search results.
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: `/${locale}/signup` },
  };
}

export default async function LocaleSignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("signup");
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
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

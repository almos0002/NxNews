import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { breakingHeadline } from "@/app/_data/articles";
import LoginForm from "@/app/_components/LoginForm";
import styles from "@/app/login/page.module.css";

export const metadata: Metadata = {
  title: "Sign In — KumariHub",
};

export default async function LocaleLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const t = await getTranslations("login");
  const { from } = await searchParams;

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

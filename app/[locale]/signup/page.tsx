import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { breakingHeadline } from "@/app/_data/articles";
import SignupForm from "@/app/_components/SignupForm";
import styles from "@/app/signup/page.module.css";

export const metadata: Metadata = {
  title: "Create Account — KumariHub",
};

export default async function LocaleSignupPage() {
  const t = await getTranslations("signup");

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

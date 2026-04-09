import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { breakingHeadline } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import styles from "@/app/login/page.module.css";

export const metadata: Metadata = {
  title: "Sign In — KumariHub",
};

export default async function LocaleLoginPage() {
  const t = await getTranslations("login");

  return (
    <>
      <BreakingTicker headline={breakingHeadline} />
      <Header />
      <main className={styles.main}>
        <div className={styles.panel}>

          {/* ── Left brand panel ── */}
          <div className={styles.brandSide}>
            <div className={styles.brandTop}>
              <Link href="/" className={styles.brandLogo}>
                <Image src="/logo.png" alt="KumariHub" width={140} height={44} style={{ objectFit: "contain" }} />
              </Link>
              <p className={styles.brandTagline}>
                Independent, in-depth<br />journalism for a<br /><span>complex world.</span>
              </p>
              <div className={styles.brandPerks}>
                {["Unlimited article access", "Morning Briefing newsletter", "Personalised reading list", "Ad-light reading experience"].map((p) => (
                  <div key={p} className={styles.brandPerk}>
                    <span className={styles.perkDot} />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <p className={styles.brandQuote}>
              Trusted by readers across Nepal and around the world.
            </p>
          </div>

          {/* ── Right form panel ── */}
          <div className={styles.formSide}>
            <div className={styles.formHeader}>
              <h1 className={styles.heading}>{t("title")}</h1>
              <p className={styles.subheading}>{t("subtitle")}</p>
            </div>

            <form className={styles.form} action="#">
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>{t("email")}</label>
                <input id="email" type="email" name="email" autoComplete="email"
                  placeholder={t("emailPlaceholder")} className={styles.input} required />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.label}>{t("password")}</label>
                  <Link href="/forgot-password" className={styles.forgotLink}>{t("forgotPassword")}</Link>
                </div>
                <input id="password" type="password" name="password" autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")} className={styles.input} required />
              </div>

              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="remember" className={styles.checkbox} />
                <span>{t("keepSignedIn")}</span>
              </label>

              <button type="submit" className={styles.submitBtn}>{t("signIn")}</button>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>{t("orWith")}</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.socialRow}>
              <button className={styles.socialBtn} type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("withGoogle")}
              </button>
              <button className={styles.socialBtn} type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t("withGithub")}
              </button>
            </div>

            <p className={styles.footer}>
              {t("noAccount")}{" "}
              <Link href="/signup" className={styles.footerLink}>{t("createOne")}</Link>
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

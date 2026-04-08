import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./Footer.module.css";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <span className={styles.logoMark}>DR</span>
              <span className={styles.logoText}>The Daily Report</span>
            </div>
            <p className={styles.description}>{t("description")}</p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>{t("sections")}</h3>
              <ul className={styles.linkList}>
                <li><Link href="/world">{tNav("world")}</Link></li>
                <li><Link href="/politics">{tNav("politics")}</Link></li>
                <li><Link href="/business">{tNav("business")}</Link></li>
                <li><Link href="/technology">{tNav("technology")}</Link></li>
                <li><Link href="/science">{tNav("science")}</Link></li>
                <li><Link href="/culture">{tNav("culture")}</Link></li>
              </ul>
            </div>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>{t("company")}</h3>
              <ul className={styles.linkList}>
                <li><Link href="/about">{t("about")}</Link></li>
                <li><Link href="/careers">{t("careers")}</Link></li>
                <li><Link href="/contact">{t("contact")}</Link></li>
                <li><Link href="/advertise">{t("advertise")}</Link></li>
                <li><Link href="/ethics">{t("ethics")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{t("copyright")}</span>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/terms">{t("terms")}</Link>
            <Link href="/cookies">{t("cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

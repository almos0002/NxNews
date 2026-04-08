"use client";

import { useT } from "@/app/_i18n/LanguageContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const t = useT();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <span className={styles.logoMark}>DR</span>
              <span className={styles.logoText}>The Daily Report</span>
            </div>
            <p className={styles.description}>{t("footer.description")}</p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>{t("footer.sections")}</h3>
              <ul className={styles.linkList}>
                <li><a href="/world">{t("nav.world")}</a></li>
                <li><a href="/politics">{t("nav.politics")}</a></li>
                <li><a href="/business">{t("nav.business")}</a></li>
                <li><a href="/technology">{t("nav.technology")}</a></li>
                <li><a href="/science">{t("nav.science")}</a></li>
                <li><a href="/culture">{t("nav.culture")}</a></li>
              </ul>
            </div>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>{t("footer.more")}</h3>
              <ul className={styles.linkList}>
                <li><a href="/about">{t("footer.about")}</a></li>
                <li><a href="/contact">{t("footer.contact")}</a></li>
                <li><a href="/advertise">{t("footer.advertise")}</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{t("footer.copyright")}</span>
          <div className={styles.bottomLinks}>
            <a href="/privacy">{t("footer.privacy")}</a>
            <a href="/terms">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

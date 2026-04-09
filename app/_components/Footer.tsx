import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFooterSections, getBottomItems } from "@/lib/menu";
import styles from "./Footer.module.css";

export default async function Footer() {
  const t = await getTranslations("footer");

  const [sections, bottomItems] = await Promise.all([
    getFooterSections().catch(() => []),
    getBottomItems().catch(() => []),
  ]);

  const hasManagedFooter = sections.length > 0;
  const hasManagedBottom = bottomItems.length > 0;

  function resolveHref(item: { link_type: string; url: string; page_slug?: string }): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    return item.url || "#";
  }

  function renderLink(item: { id: string; link_type: string; url: string; page_slug?: string; open_new_tab: boolean; label_en: string }) {
    const href = resolveHref(item);
    const isExternal = item.link_type === "external" && (href.startsWith("http") || href.startsWith("//"));
    if (isExternal || item.open_new_tab) {
      return (
        <a href={href} target={item.open_new_tab ? "_blank" : undefined} rel="noopener noreferrer">
          {item.label_en}
        </a>
      );
    }
    return (
      <Link href={href as Parameters<typeof Link>[0]["href"]}>
        {item.label_en}
      </Link>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <span className={styles.logoMark}>K</span>
              <span className={styles.logoText}>KumariHub</span>
            </div>
            <p className={styles.description}>{t("description")}</p>
          </div>

          <div className={styles.links}>
            {hasManagedFooter ? (
              /* Dynamic footer sections from database */
              sections.map((section) => (
                <div key={section.label_en || "unsectioned"} className={styles.column}>
                  {section.label_en && (
                    <h3 className={styles.columnTitle}>{section.label_en}</h3>
                  )}
                  <ul className={styles.linkList}>
                    {section.items.map((item) => (
                      <li key={item.id}>{renderLink(item)}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              /* Fallback static columns */
              <>
                <div className={styles.column}>
                  <h3 className={styles.columnTitle}>{t("sections")}</h3>
                  <ul className={styles.linkList}>
                    <li><Link href="/world">World</Link></li>
                    <li><Link href="/politics">Politics</Link></li>
                    <li><Link href="/business">Business</Link></li>
                    <li><Link href="/technology">Technology</Link></li>
                    <li><Link href="/science">Science</Link></li>
                  </ul>
                </div>
                <div className={styles.column}>
                  <h3 className={styles.columnTitle}>{t("company")}</h3>
                  <ul className={styles.linkList}>
                    <li><Link href="/about">{t("about")}</Link></li>
                    <li><Link href="/careers">{t("careers")}</Link></li>
                    <li><Link href="/contact">{t("contact")}</Link></li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <span>{t("copyright")}</span>
          <div className={styles.bottomLinks}>
            {hasManagedBottom ? (
              bottomItems.map((item) => (
                <span key={item.id}>{renderLink(item)}</span>
              ))
            ) : (
              <>
                <Link href="/privacy">{t("privacy")}</Link>
                <Link href="/terms">{t("terms")}</Link>
                <Link href="/cookies">{t("cookies")}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

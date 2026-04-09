import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFooterSections, getBottomItems } from "@/lib/menu";
import type { MenuItem } from "@/lib/menu";
import styles from "./Footer.module.css";

export default async function Footer() {
  const [t, locale] = await Promise.all([
    getTranslations("footer"),
    getLocale(),
  ]);

  const [sections, bottomItems] = await Promise.all([
    getFooterSections().catch(() => []),
    getBottomItems().catch(() => []),
  ]);

  function label(item: MenuItem): string {
    return (locale === "ne" && item.label_ne) ? item.label_ne : item.label_en;
  }

  function sectionTitle(labelEn: string, labelNe: string): string {
    return (locale === "ne" && labelNe) ? labelNe : labelEn;
  }

  function resolveHref(item: MenuItem): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    if (item.link_type === "category") return `/${item.url}`;
    return item.url || "#";
  }

  function renderLink(item: MenuItem) {
    const href = resolveHref(item);
    const isExternal = item.link_type === "external" && (href.startsWith("http") || href.startsWith("//"));
    if (isExternal || item.open_new_tab) {
      return (
        <a href={href} target={item.open_new_tab ? "_blank" : undefined} rel="noopener noreferrer">
          {label(item)}
        </a>
      );
    }
    return (
      <Link href={href as Parameters<typeof Link>[0]["href"]}>
        {label(item)}
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

          {sections.length > 0 && (
            <div className={styles.links}>
              {sections.map((section) => (
                <div key={section.label_en || "unsectioned"} className={styles.column}>
                  {(section.label_en || section.label_ne) && (
                    <h3 className={styles.columnTitle}>
                      {sectionTitle(section.label_en, section.label_ne)}
                    </h3>
                  )}
                  <ul className={styles.linkList}>
                    {section.items.map((item) => (
                      <li key={item.id}>{renderLink(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <span>{t("copyright")}</span>
          {bottomItems.length > 0 && (
            <div className={styles.bottomLinks}>
              {bottomItems.map((item) => (
                <span key={item.id}>{renderLink(item)}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

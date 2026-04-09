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

  function resolveHref(item: { link_type: string; url: string; page_slug?: string }): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    if (item.link_type === "category") return `/${item.url}`;
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

          {sections.length > 0 && (
            <div className={styles.links}>
              {sections.map((section) => (
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

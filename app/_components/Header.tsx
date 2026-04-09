import Image from "next/image";
import { headers } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getNavbarItems } from "@/lib/menu";
import type { MenuItem } from "@/lib/menu";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";
import DateTimeClock from "./DateTimeClock";
import styles from "./Header.module.css";

export default async function Header() {
  const [t, locale] = await Promise.all([
    getTranslations("nav"),
    getLocale(),
  ]);

  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB unavailable — render unauthenticated state
  }

  const navItems = await getNavbarItems().catch(() => []);

  function label(item: MenuItem): string {
    return (locale === "ne" && item.label_ne) ? item.label_ne : item.label_en;
  }

  function resolveHref(item: MenuItem): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    if (item.link_type === "category") return `/${item.url}`;
    return item.url || "#";
  }

  return (
    <header className={styles.header}>
      {/* ── Row 1: logo centred, actions right ── */}
      <div className={styles.logoRow}>
        <MobileNav navItems={navItems} locale={locale} />

        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.png"
              alt="KumariHub"
              width={260}
              height={75}
              style={{ objectFit: "contain", height: "52px", width: "auto" }}
              priority
            />
          </Link>
          <DateTimeClock locale={locale} />
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher />

          {session ? (
            <Link href="/dashboard" className={styles.userBtn}>
              <span className={styles.userAvatar}>
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
              <span className={styles.userName}>
                {session.user.name?.split(" ")[0] ?? "Account"}
              </span>
            </Link>
          ) : (
            <Link href="/login" className={styles.signInLink}>
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Row 2: navigation + search ── */}
      {navItems.length > 0 && (
        <div className={styles.navRow}>
          <div className={styles.navInner}>
            <nav className={styles.nav} aria-label="Main navigation">
              <ul className={styles.navList}>
                {navItems.map((item) => {
                  const href = resolveHref(item);
                  const isExternal = item.link_type === "external" && (href.startsWith("http") || href.startsWith("//"));
                  return (
                    <li key={item.id}>
                      {isExternal || item.open_new_tab ? (
                        <a
                          href={href}
                          className={styles.navLink}
                          target={item.open_new_tab ? "_blank" : undefined}
                          rel="noopener noreferrer"
                        >
                          {label(item)}
                        </a>
                      ) : (
                        <Link href={href as Parameters<typeof Link>[0]["href"]} className={styles.navLink}>
                          {label(item)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
            <Link href="/search" className={styles.searchBtn} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

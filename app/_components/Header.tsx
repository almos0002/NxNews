import Image from "next/image";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { categories } from "@/app/_data/articles";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getNavbarItems } from "@/lib/menu";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";
import styles from "./Header.module.css";

export default async function Header() {
  const t = await getTranslations("nav");

  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB unavailable — render unauthenticated state
  }

  const navItems = await getNavbarItems().catch(() => []);
  const hasManagedNav = navItems.length > 0;

  const catKeys: Record<string, string> = {
    World: "world", Politics: "politics", Business: "business",
    Technology: "technology", Science: "science", Culture: "culture",
    Opinion: "opinion", Sports: "sports", Videos: "videos",
    Weather: "weather", Entertainment: "entertainment",
  };

  function resolveHref(item: { link_type: string; url: string; page_slug?: string }): string {
    if (item.link_type === "page") return item.page_slug ? `/${item.page_slug}` : "#";
    return item.url || "#";
  }

  return (
    <header className={styles.header}>
      {/* ── Row 1: logo centred, actions right ── */}
      <div className={styles.logoRow}>
        <MobileNav />

        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="KumariHub"
            width={260}
            height={75}
            style={{ objectFit: "contain", height: "58px", width: "auto" }}
            priority
          />
        </Link>

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
              Sign in
            </Link>
          )}

          <Link href="/subscribe" className={styles.subscribeLink}>
            {t("subscribe")}
          </Link>
        </div>
      </div>

      {/* ── Row 2: navigation ── */}
      <div className={styles.navRow}>
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {hasManagedNav ? (
              navItems.map((item) => {
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
                        {item.label_en}
                      </a>
                    ) : (
                      <Link href={href as Parameters<typeof Link>[0]["href"]} className={styles.navLink}>
                        {item.label_en}
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              /* Fallback to hardcoded categories when no navbar links configured */
              categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/${cat.toLowerCase()}`} className={styles.navLink}>
                    {t(catKeys[cat] ?? cat.toLowerCase())}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

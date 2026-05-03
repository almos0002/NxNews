import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { noticiaText, dmSans } from "@/app/fonts";
import { getSiteName, FALLBACK_SITE_NAME } from "@/lib/cms/site-name";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const locale =
    h.get("x-locale") ||
    (h.get("x-pathname")?.startsWith("/ne") ? "ne" : "en");
  const siteName = await getSiteName(locale).catch(() => FALLBACK_SITE_NAME);
  return {
    applicationName: siteName,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#e63946",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Locale is set by `proxy.ts` on every locale-prefixed request. Falls back
  // to "en" for the rare case the request bypassed the proxy (e.g. the root
  // app/not-found rendered for a path the matcher excludes).
  const h = await headers();
  const locale =
    h.get("x-locale") ||
    (h.get("x-pathname")?.startsWith("/ne") ? "ne" : "en");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${noticiaText.variable} ${dmSans.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { noticiaText, dmSans } from "@/app/fonts";
import { getAllSettings } from "@/lib/settings";
import "@/app/globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  let s: Record<string, string> = {};
  try { s = await getAllSettings() as Record<string, string>; } catch { /* use defaults */ }

  const isNe = locale === "ne";
  const title       = isNe ? (s.site_title_ne       || s.site_title_en       || "KumariHub") : (s.site_title_en       || "KumariHub");
  const description = isNe ? (s.site_description_ne || s.site_description_en || "")          : (s.site_description_en || "");
  const favicon     = s.favicon_url || "/favicon.ico";

  return {
    title,
    description,
    icons: { icon: favicon },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ne: "/ne" },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ne")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${noticiaText.variable} ${dmSans.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

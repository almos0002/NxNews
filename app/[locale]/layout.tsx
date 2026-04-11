import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAllSettings } from "@/lib/settings";
import HtmlLang from "@/app/_components/HtmlLang";

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

  const verificationOther: Record<string, string> = {};
  if (s.seo_bing_verification)      verificationOther["msvalidate.01"]         = s.seo_bing_verification;
  if (s.seo_baidu_verification)     verificationOther["baidu-site-verification"] = s.seo_baidu_verification;
  if (s.seo_pinterest_verification) verificationOther["p:domain_verify"]        = s.seo_pinterest_verification;

  return {
    title,
    description,
    icons: { icon: favicon },
    verification: {
      google:  s.seo_gsc_verification     || undefined,
      yandex:  s.seo_yandex_verification  || undefined,
      other:   Object.keys(verificationOther).length > 0 ? verificationOther : undefined,
    },
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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}

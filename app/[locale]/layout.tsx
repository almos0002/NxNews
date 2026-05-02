import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAllSettings } from "@/lib/cms/settings";
import HtmlLang from "@/app/_components/layout/HtmlLang";

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

  const baseUrl = s.seo_canonical_base_url?.replace(/\/$/, "") || "https://kumarihub.com";
  const ogLogoUrl = s.logo_url || `${baseUrl}/og-default.png`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    icons: { icon: favicon },
    verification: {
      google:  s.seo_gsc_verification     || undefined,
      yandex:  s.seo_yandex_verification  || undefined,
      other:   Object.keys(verificationOther).length > 0 ? verificationOther : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: { en: `${baseUrl}/en`, ne: `${baseUrl}/ne` },
    },
    openGraph: {
      siteName: s.site_title_en || "KumariHub",
      title,
      description: description || undefined,
      url: `${baseUrl}/${locale}`,
      type: "website",
      images: ogLogoUrl ? [{ url: ogLogoUrl, width: 1200, height: 630, alt: title }] : undefined,
      locale: locale === "ne" ? "ne_NP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: ogLogoUrl ? [ogLogoUrl] : undefined,
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

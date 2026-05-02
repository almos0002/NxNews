import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getAllSettings } from "@/lib/cms/settings";
import { resolveBaseUrlSync, OG_DEFAULT_IMAGE } from "@/lib/seo/site-url";
import JsonLd from "@/app/_components/seo/JsonLd";

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
  const description = isNe
    ? (s.site_description_ne || s.site_description_en || "Latest news from Nepal — politics, sports, entertainment, business, and more.")
    : (s.site_description_en || "Latest news from Nepal — politics, sports, entertainment, business, and more.");
  // Fall back to the bundled logo.png so the icon link never 404s in
  // browsers / Slack / etc. when the admin has not yet uploaded a favicon.
  const favicon     = s.favicon_url || "/logo.png";

  const verificationOther: Record<string, string> = {};
  if (s.seo_bing_verification)      verificationOther["msvalidate.01"]         = s.seo_bing_verification;
  if (s.seo_baidu_verification)     verificationOther["baidu-site-verification"] = s.seo_baidu_verification;
  if (s.seo_pinterest_verification) verificationOther["p:domain_verify"]        = s.seo_pinterest_verification;

  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  // OG image: prefer admin-set URL, then site logo, then bundled default.
  // We always emit an absolute URL — WhatsApp / Slack / Twitter all REQUIRE
  // og:image to be a fully-qualified URL they can fetch from the public
  // internet, so passing a string (not the {url, width, height} object) is
  // the most reliable form across Next.js metadata API versions.
  const ogImageUrl = s.seo_og_image_url || s.logo_url || `${baseUrl}${OG_DEFAULT_IMAGE.path}`;

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
      languages: {
        en: `${baseUrl}/en`,
        ne: `${baseUrl}/ne`,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      siteName: s.site_title_en || "KumariHub",
      title,
      description,
      url: `${baseUrl}/${locale}`,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: OG_DEFAULT_IMAGE.width,
          height: OG_DEFAULT_IMAGE.height,
          alt: title,
        },
      ],
      locale: locale === "ne" ? "ne_NP" : "en_US",
      alternateLocale: locale === "ne" ? ["en_US"] : ["ne_NP"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ne")) {
    notFound();
  }

  const messages = await getMessages();

  // Site-wide structured data: Organization + WebSite (with SearchAction).
  // Settings-driven so editors can update logo / social links without code.
  let s: Record<string, string> = {};
  try { s = await getAllSettings() as Record<string, string>; } catch { /* use defaults */ }
  const baseUrl = resolveBaseUrlSync(s.seo_canonical_base_url);
  const orgName = s.site_title_en || "KumariHub";
  const orgLogo = s.logo_url || `${baseUrl}/logo.png`;
  const sameAs = [
    s.social_twitter,
    s.social_facebook,
    s.social_instagram,
    s.social_youtube,
  ].filter((u): u is string => !!u && /^https?:\/\//.test(u));

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${baseUrl}/#organization`,
    name: orgName,
    url: baseUrl,
    logo: { "@type": "ImageObject", url: orgLogo },
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: orgName,
    inLanguage: locale === "ne" ? "ne-NP" : "en-US",
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={[orgJsonLd, websiteJsonLd]} />
      {children}
    </NextIntlClientProvider>
  );
}

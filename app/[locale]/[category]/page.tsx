import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { categories } from "@/app/_data/articles";
import { getArticlesByCategory } from "@/app/_data/getAllArticles";
import { localizeArticles, getBreakingHeadline } from "@/app/_data/localize";
import { categoryDescriptionsNe } from "@/app/_data/articlesNe";
import { routing } from "@/i18n/routing";

const RESERVED = new Set(["login", "signup", "article", "tags", "search", "author"]);

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((cat) => ({ locale, category: cat.toLowerCase() }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const label = categories.find((c) => c.toLowerCase() === category) ?? category;
  return {
    title: `${label} — The Daily Report`,
    alternates: { languages: { en: `/en/${category}`, ne: `/ne/${category}` } },
  };
}

const categoryDescriptionsEn: Record<string, string> = {
  world: "On-the-ground reporting from every corner of the globe — conflict, diplomacy, development, and the events that shape our interconnected world.",
  politics: "In-depth analysis and breaking coverage of national and international politics, policy, and governance.",
  business: "Markets, companies, economics, and the forces driving the global economy.",
  technology: "The people, ideas, and breakthroughs transforming how we live, work, and communicate.",
  science: "Discoveries, research, and the scientists pushing back the boundaries of what we know.",
  culture: "Arts, film, books, ideas, and the stories that define the age we live in.",
  opinion: "Perspectives and commentary from columnists, academics, and thought leaders.",
  sports: "Results, analysis, and long-form storytelling from the world of sport.",
};

export default async function CategoryPage({ params }: Props) {
  const { category, locale } = await params;

  if (RESERVED.has(category)) notFound();

  const label = categories.find((c) => c.toLowerCase() === category);
  if (!label) notFound();

  const t = await getTranslations("archive");
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const rawArticles = getArticlesByCategory(label);
  const articles = localizeArticles(rawArticles, locale);
  const headline = getBreakingHeadline(locale);

  const descriptions = locale === "ne" ? categoryDescriptionsNe : categoryDescriptionsEn;
  const navKeys: Record<string, "world" | "politics" | "business" | "technology" | "science" | "culture" | "opinion" | "sports"> = {
    world: "world", politics: "politics", business: "business",
    technology: "technology", science: "science", culture: "culture",
    opinion: "opinion", sports: "sports",
  };
  const navKey = navKeys[category];
  const translatedTitle = navKey ? tNav(navKey) : label;

  return (
    <>
      <BreakingTicker headline={headline} />
      <Header />
      <ArchiveLayout
        badge={t("categoryBadge")}
        title={translatedTitle}
        description={descriptions[category]}
        count={articles.length}
        articles={articles}
      />
      <Footer />
    </>
  );
}

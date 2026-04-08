import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { categories } from "@/app/_data/articles";
import { getArticlesByCategory } from "@/app/_data/getAllArticles";
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
    alternates: {
      languages: { en: `/en/${category}`, ne: `/ne/${category}` },
    },
  };
}

const categoryDescriptions: Record<string, string> = {
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
  const { category } = await params;

  if (RESERVED.has(category)) notFound();

  const label = categories.find((c) => c.toLowerCase() === category);
  if (!label) notFound();

  const t = await getTranslations("archive");
  const articles = getArticlesByCategory(label);
  const count = articles.length;

  return (
    <>
      <BreakingTicker />
      <Header />
      <ArchiveLayout
        badge={t("categoryBadge")}
        title={label}
        description={categoryDescriptions[category]}
        count={count}
        articles={articles}
      />
      <Footer />
    </>
  );
}

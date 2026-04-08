import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { categories } from "@/app/_data/articles";
import { getArticlesByCategory } from "@/app/_data/getAllArticles";

const RESERVED = new Set(["login", "signup", "article", "tags", "search", "author"]);

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = categories.find((c) => c.toLowerCase() === category) ?? category;
  return {
    title: `${label} | The Daily Report`,
    description: `Latest ${label} news, analysis, and reporting from The Daily Report.`,
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

  const articles = getArticlesByCategory(label);

  return (
    <>
      <BreakingTicker />
      <Header />
      <ArchiveLayout
        badge="Category"
        title={label}
        description={categoryDescriptions[category] ?? `Latest ${label} coverage from The Daily Report.`}
        count={articles.length}
        articles={articles}
      />
      <Footer />
    </>
  );
}

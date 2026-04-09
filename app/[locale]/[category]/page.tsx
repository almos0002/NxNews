import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import {
  getPublicArticles,
  getBreakingHeadline,
} from "@/lib/public";

const RESERVED = new Set(["login", "signup", "article", "tags", "search", "author", "videos", "weather"]);

const VALID_CATEGORIES = new Set([
  "world", "politics", "business", "technology",
  "science", "culture", "opinion", "sports", "entertainment",
]);

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${label} — KumariHub`,
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
  entertainment: "Film, television, music, celebrity — the stories behind the stories.",
};

const categoryDescriptionsNe: Record<string, string> = {
  world: "विश्वका हर कुनाबाट जमिनस्तरीय रिपोर्टिङ — संघर्ष, कूटनीति, विकास, र हाम्रो परस्पर जोडिएको विश्वलाई आकार दिने घटनाहरू।",
  politics: "राष्ट्रिय र अन्तर्राष्ट्रिय राजनीति, नीति, र शासनको गहन विश्लेषण र तत्कालीन कवरेज।",
  business: "बजार, कम्पनीहरू, अर्थशास्त्र, र वैश्विक अर्थतन्त्रलाई चलाउने शक्तिहरू।",
  technology: "मानिस, विचार, र नवीनतम खोजहरू जसले हाम्रो जीवन, काम, र संचारलाई रूपान्तरण गर्दैछन्।",
  science: "खोजहरू, अनुसन्धान, र हामीले जान्ने सीमाहरू पछाडि धकेल्ने वैज्ञानिकहरू।",
  culture: "कला, फिल्म, पुस्तकहरू, विचारहरू, र हामी बाँचिरहेको युगलाई परिभाषित गर्ने कथाहरू।",
  opinion: "स्तम्भकारहरू, शिक्षाविद्हरू, र विचार नेताहरूका दृष्टिकोण र टिप्पणीहरू।",
  sports: "खेलकुदको संसारबाट नतिजाहरू, विश्लेषण, र दीर्घ-स्वरूप कथा।",
  entertainment: "फिल्म, टेलिभिजन, संगीत, सेलिब्रिटी — कथाहरूका पछाडिका कथाहरू।",
};

export default async function CategoryPage({ params }: Props) {
  const { category, locale } = await params;

  if (RESERVED.has(category)) notFound();
  if (!VALID_CATEGORIES.has(category)) notFound();

  const t = await getTranslations("archive");
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const [articles, headline] = await Promise.all([
    getPublicArticles(locale, { category }),
    getBreakingHeadline(locale),
  ]);

  const descriptions = locale === "ne" ? categoryDescriptionsNe : categoryDescriptionsEn;

  const navKeys: Record<string, string> = {
    world: "world", politics: "politics", business: "business",
    technology: "technology", science: "science", culture: "culture",
    opinion: "opinion", sports: "sports", entertainment: "entertainment",
  };
  const navKey = navKeys[category] as "world" | "politics" | "business" | "technology" | "science" | "culture" | "opinion" | "sports" | undefined;
  const translatedTitle = navKey ? tNav(navKey) : category.charAt(0).toUpperCase() + category.slice(1);

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreakingTicker from "@/app/_components/BreakingTicker";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import ArchiveLayout from "@/app/_components/ArchiveLayout";
import { tags, getTagBySlug } from "@/app/_data/tags";
import { getArticlesByTag } from "@/app/_data/getAllArticles";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const tagData = getTagBySlug(tag);
  const label = tagData?.label ?? tag.replace(/-/g, " ");
  return {
    title: `${label} | The Daily Report`,
    description: tagData?.description ?? `News and analysis tagged "${label}" from The Daily Report.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const tagData = getTagBySlug(tag);
  if (!tagData) notFound();

  const articles = getArticlesByTag(tag);

  return (
    <>
      <BreakingTicker />
      <Header />
      <ArchiveLayout
        badge="Topic"
        title={tagData.label}
        description={tagData.description}
        count={articles.length}
        articles={articles}
      />
      <Footer />
    </>
  );
}

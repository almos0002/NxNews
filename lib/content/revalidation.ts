import { revalidatePath, revalidateTag } from "next/cache";
import { listCategories, listTags } from "./taxonomy";

const LOCALES = ["en", "ne"] as const;

export interface ArticleRevalidateInput {
  slugs: string[];
  categories: string[];
  tags: string[];
}

// Resolve a stored category/tag string to its taxonomy slug, or pass through.
function resolveSlug(value: string, entries: { slug: string; name_en: string; name_ne: string }[]): string {
  const needle = value.toLowerCase();
  const match = entries.find(
    (e) =>
      e.slug.toLowerCase() === needle ||
      e.name_en.toLowerCase() === needle ||
      (e.name_ne && e.name_ne.toLowerCase() === needle),
  );
  return match ? match.slug : value;
}

export async function revalidateArticleSurfaces({ slugs, categories, tags }: ArticleRevalidateInput) {
  revalidateTag("categories", { expire: 0 });
  revalidateTag("tags", { expire: 0 });

  const [allCategories, allTags] = await Promise.all([listCategories(), listTags()]);

  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  const uniqueCategories = Array.from(new Set(
    categories.filter(Boolean).map((c) => resolveSlug(c, allCategories)),
  ));
  const uniqueTags = Array.from(new Set(
    tags.filter(Boolean).map((t) => resolveSlug(t, allTags)),
  ));

  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/latest`);
    for (const slug of uniqueSlugs) {
      revalidatePath(`/${locale}/article/${slug}`);
    }
    for (const category of uniqueCategories) {
      revalidatePath(`/${locale}/${category}`);
    }
    for (const tag of uniqueTags) {
      revalidatePath(`/${locale}/tags/${tag}`);
    }
  }
}

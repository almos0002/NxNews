import type { Article } from "./articles";
import {
  featuredArticle,
  secondaryFeatured,
  latestNews,
  editorsPicks,
  gridArticles,
  businessArticles,
  techArticles,
  opinionArticles,
  categories,
} from "./articles";
import { tagArticleMap } from "./tags";
import { nameToSlug } from "./authors";

export { categories };

export function getAllArticles(): Article[] {
  return [
    featuredArticle,
    ...secondaryFeatured,
    ...latestNews,
    ...editorsPicks,
    ...gridArticles,
    ...businessArticles,
    ...techArticles,
    ...opinionArticles,
  ];
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function getArticlesByCategory(category: string): Article[] {
  const normalised = category.toLowerCase();
  return getAllArticles().filter(
    (a) => a.category.toLowerCase() === normalised && a.imageUrl
  );
}

export function getArticlesByTag(tag: string): Article[] {
  const ids = tagArticleMap[tag] ?? [];
  const all = getAllArticles();
  return ids
    .map((id) => all.find((a) => a.id === id))
    .filter((a): a is Article => !!a && !!a.imageUrl);
}

export function getArticlesByAuthor(authorName: string): Article[] {
  const normalised = authorName.toLowerCase();
  return getAllArticles().filter(
    (a) => a.author.toLowerCase() === normalised && a.imageUrl
  );
}

export function searchArticles(query: string): Article[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getAllArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q)
  );
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  return getAllArticles()
    .filter((a) => a.id !== article.id && a.imageUrl)
    .filter((a) => a.category === article.category || a.excerpt)
    .slice(0, count);
}

export function getAllAuthorNames(): string[] {
  const names = new Set(getAllArticles().map((a) => a.author));
  return Array.from(names);
}

export function getAllAuthorSlugsFromArticles(): { slug: string }[] {
  return getAllAuthorNames().map((name) => ({ slug: nameToSlug(name) }));
}

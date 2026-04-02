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
} from "./articles";

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

export function getRelatedArticles(article: Article, count = 3): Article[] {
  return getAllArticles()
    .filter((a) => a.id !== article.id && a.imageUrl)
    .filter((a) => a.category === article.category || a.excerpt)
    .slice(0, count);
}

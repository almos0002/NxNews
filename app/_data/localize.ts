import type { Article } from "./articles";
import { articleTranslationsNe } from "./articlesNe";

export function localizeArticle(article: Article, locale: string): Article {
  if (locale !== "ne") return article;
  const t = articleTranslationsNe[article.id];
  if (!t) return article;
  return {
    ...article,
    title: t.title ?? article.title,
    excerpt: t.excerpt !== undefined ? t.excerpt : article.excerpt,
  };
}

export function localizeArticles(articles: Article[], locale: string): Article[] {
  if (locale !== "ne") return articles;
  return articles.map((a) => localizeArticle(a, locale));
}

export function localizeTrending(
  articles: { id: string; title: string; category: string }[],
  locale: string
) {
  if (locale !== "ne") return articles;
  return articles.map((a) => {
    const t = articleTranslationsNe[a.id];
    return t ? { ...a, title: t.title } : a;
  });
}

export function getBreakingHeadline(locale: string): string {
  if (locale === "ne") {
    return "वैश्विक जलवायु शिखर सम्मेलनले कार्बन उत्सर्जनमा ऐतिहासिक सम्झौतामा पुग्यो";
  }
  return "Global Climate Summit Reaches Historic Agreement on Carbon Emissions";
}

import { getTranslations } from "next-intl/server";
import styles from "./CategoryBadge.module.css";

const categoryKeyMap: Record<string, string> = {
  world: "world",
  politics: "politics",
  business: "business",
  technology: "technology",
  science: "science",
  culture: "culture",
  opinion: "opinion",
  sports: "sports",
};

export default async function CategoryBadge({
  category,
  variant = "default",
}: {
  category: string;
  variant?: "default" | "accent" | "light";
}) {
  const t = await getTranslations("nav");
  const key = categoryKeyMap[category.toLowerCase()];
  const label = key ? t(key as Parameters<typeof t>[0]) : category;

  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {variant === "accent" && <span className={styles.dot} aria-hidden="true" />}
      {label}
    </span>
  );
}

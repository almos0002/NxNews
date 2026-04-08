"use client";

import { useT } from "@/app/_i18n/LanguageContext";
import styles from "./CategoryBadge.module.css";

const categoryKeyMap: Record<string, string> = {
  world: "nav.world",
  politics: "nav.politics",
  business: "nav.business",
  technology: "nav.technology",
  science: "nav.science",
  culture: "nav.culture",
  opinion: "nav.opinion",
  sports: "nav.sports",
};

export default function CategoryBadge({
  category,
  variant = "default",
}: {
  category: string;
  variant?: "default" | "accent" | "light";
}) {
  const t = useT();
  const key = categoryKeyMap[category.toLowerCase()];
  const label = key ? t(key) : category;

  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {variant === "accent" && <span className={styles.dot} aria-hidden="true" />}
      {label}
    </span>
  );
}

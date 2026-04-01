import styles from "./CategoryBadge.module.css";

export default function CategoryBadge({
  category,
  variant = "dark",
}: {
  category: string;
  variant?: "dark" | "outline" | "accent";
}) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{category}</span>
  );
}

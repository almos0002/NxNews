import styles from "./CategoryBadge.module.css";

export default function CategoryBadge({
  category,
  variant = "default",
}: {
  category: string;
  variant?: "default" | "accent";
}) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{category}</span>
  );
}

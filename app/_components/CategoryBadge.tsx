import styles from "./CategoryBadge.module.css";

export default function CategoryBadge({
  category,
  variant = "default",
}: {
  category: string;
  variant?: "default" | "accent" | "light";
}) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {variant === "accent" && <span className={styles.dot} aria-hidden="true" />}
      {category}
    </span>
  );
}

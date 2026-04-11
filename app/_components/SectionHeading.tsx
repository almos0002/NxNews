import { Link } from "@/i18n/navigation";
import styles from "./SectionHeading.module.css";

export default function SectionHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.rule} />
      {href && (
        <Link href={href} className={styles.viewAll}>
          View All →
        </Link>
      )}
    </div>
  );
}

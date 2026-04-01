import styles from "./SectionHeading.module.css";

export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.rule} />
    </div>
  );
}

import styles from "./SectionHeading.module.css";

export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.rule} />
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}

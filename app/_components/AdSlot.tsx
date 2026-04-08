import styles from "./AdSlot.module.css";

type AdVariant = "leaderboard" | "billboard" | "rectangle" | "halfpage";

const AD_SPECS: Record<AdVariant, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90,  label: "Leaderboard" },
  billboard:   { w: 970, h: 250, label: "Billboard" },
  rectangle:   { w: 300, h: 250, label: "Medium Rectangle" },
  halfpage:    { w: 300, h: 600, label: "Half Page" },
};

interface AdSlotProps {
  variant?: AdVariant;
  className?: string;
}

export default function AdSlot({ variant = "leaderboard", className }: AdSlotProps) {
  const spec = AD_SPECS[variant];

  return (
    <div className={`${styles.wrapper} ${styles[variant]} ${className ?? ""}`}>
      <p className={styles.label}>Advertisement</p>
      <div className={styles.placeholder}>
        <span className={styles.adName}>{spec.label}</span>
        <span className={styles.dims}>{spec.w} × {spec.h} px</span>
      </div>
    </div>
  );
}

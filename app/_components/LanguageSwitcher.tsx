"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();

  const other = locale === "en" ? "ne" : "en";

  const handleSwitch = () => {
    startTransition(() => {
      router.replace(pathname, { locale: other });
    });
  };

  return (
    <button
      onClick={handleSwitch}
      className={styles.btn}
      title={t("switchTo")}
      aria-label={t("switchTo")}
      disabled={isPending}
    >
      <span className={styles.active}>{t(locale as "en" | "ne")}</span>
      <span className={styles.sep}>|</span>
      <span className={styles.inactive}>{t(other as "en" | "ne")}</span>
    </button>
  );
}

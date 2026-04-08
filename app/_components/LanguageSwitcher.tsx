"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import styles from "./LanguageSwitcher.module.css";

interface Props {
  variant?: "header" | "drawer";
}

export default function LanguageSwitcher({ variant = "header" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();

  const switchTo = (target: string) => {
    if (target === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  };

  return (
    <div
      className={`${styles.toggle} ${variant === "drawer" ? styles.drawer : ""}`}
      aria-label={t("switchTo")}
      role="group"
    >
      {(["en", "ne"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => switchTo(lang)}
          className={`${styles.option} ${locale === lang ? styles.active : styles.inactive}`}
          disabled={isPending || locale === lang}
          aria-pressed={locale === lang}
          aria-label={`Switch to ${lang.toUpperCase()}`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

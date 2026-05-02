"use client";

import { useState, useEffect } from "react";
import styles from "./DateTimeClock.module.css";

const NE_MONTHS = [
  "बैशाख", "जेठ", "असार", "साउन", "भाद्र", "असोज",
  "कार्तिक", "मङ्सिर", "पुस", "माघ", "फागुन", "चैत",
];

const NE_DAYS = ["आइत", "सोम", "मङ्गल", "बुध", "बिही", "शुक्र", "शनि"];

const NE_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function toNepaliNumerals(n: number): string {
  return String(n)
    .split("")
    .map((d) => NE_DIGITS[parseInt(d)] ?? d)
    .join("");
}

function toNepaliTime(h: number, m: number): string {
  const period = h < 12 ? "बिहान" : h < 17 ? "दिउँसो" : h < 20 ? "साँझ" : "राति";
  const hour12 = h % 12 || 12;
  return `${period} ${toNepaliNumerals(hour12)}:${toNepaliNumerals(m).padStart(2, "०")}`;
}

function toBSDate(date: Date): { year: number; month: number; day: number } | null {
  try {
    // Dynamic import-safe: use require at runtime only
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NepaliDate = require("nepali-date-converter").default ?? require("nepali-date-converter");
    const nd = new NepaliDate(date);
    return { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
  } catch {
    return null;
  }
}

interface Props {
  locale?: string;
}

export default function DateTimeClock({ locale = "en" }: Props) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();

      if (locale === "ne") {
        const bs = toBSDate(now);
        if (bs) {
          const dayName = NE_DAYS[now.getDay()];
          const monthName = NE_MONTHS[bs.month];
          const dateStr = `${dayName}, ${toNepaliNumerals(bs.year)} ${monthName} ${toNepaliNumerals(bs.day)}`;
          const timeStr = toNepaliTime(now.getHours(), now.getMinutes());
          setDisplay(`${dateStr} | ${timeStr}`);
          return;
        }
      }

      setDisplay(
        new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(now)
      );
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [locale]);

  if (!display) return null;
  return <p className={styles.clock}>{display}</p>;
}

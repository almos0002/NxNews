"use client";

import { useState } from "react";
import {
  BS_MONTH_NAMES_EN, BS_MONTH_NAMES_NE,
  AD_MONTH_NAMES_EN, WEEKDAYS_EN, WEEKDAYS_NE,
  toNepaliDigits, adToBS, bsToAD,
  getDaysInBSMonth, getFirstWeekdayOfBSMonth,
  getDaysInADMonth, getFirstWeekdayOfADMonth,
} from "@/lib/util/nepali-calendar";
import styles from "./CalendarClient.module.css";

type Mode = "ad" | "bs";

function todayLocal() {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth(), day: n.getDate() };
}

export default function CalendarClient({ locale }: { locale: string }) {
  const isNe = locale === "ne";
  const td = todayLocal();
  const todayBS = adToBS(td.year, td.month, td.day);

  const [mode, setMode] = useState<Mode>("ad");
  const [adYear, setAdYear] = useState(td.year);
  const [adMonth, setAdMonth] = useState(td.month);
  const [bsYear, setBsYear] = useState(todayBS.year);
  const [bsMonth, setBsMonth] = useState(todayBS.month);

  function prevMonth() {
    if (mode === "ad") {
      if (adMonth === 0) { setAdYear(y => y - 1); setAdMonth(11); }
      else setAdMonth(m => m - 1);
    } else {
      if (bsMonth === 0) { setBsYear(y => y - 1); setBsMonth(11); }
      else setBsMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (mode === "ad") {
      if (adMonth === 11) { setAdYear(y => y + 1); setAdMonth(0); }
      else setAdMonth(m => m + 1);
    } else {
      if (bsMonth === 11) { setBsYear(y => y + 1); setBsMonth(0); }
      else setBsMonth(m => m + 1);
    }
  }

  function goToday() {
    setAdYear(td.year); setAdMonth(td.month);
    setBsYear(todayBS.year); setBsMonth(todayBS.month);
  }

  const weekdays = isNe ? WEEKDAYS_NE : WEEKDAYS_EN;

  function renderADCalendar() {
    const daysInMonth = getDaysInADMonth(adYear, adMonth);
    const firstDay = getFirstWeekdayOfADMonth(adYear, adMonth);
    const monthName = AD_MONTH_NAMES_EN[adMonth];
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className={styles.calWrap}>
        <div className={styles.monthHeader}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">‹</button>
          <div className={styles.monthTitle}>
            <span className={styles.monthName}>{monthName} {isNe ? toNepaliDigits(adYear) : adYear}</span>
            <span className={styles.monthSub}>
              {isNe ? `${toNepaliDigits(adYear)} AD` : `${adYear} AD`}
            </span>
          </div>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">›</button>
        </div>

        <div className={styles.weekRow}>
          {weekdays.map((d) => <div key={d} className={styles.weekDay}>{d}</div>)}
        </div>

        <div className={styles.grid}>
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className={styles.empty} />;
            const isToday = adYear === td.year && adMonth === td.month && day === td.day;
            const bs = adToBS(adYear, adMonth, day);
            const bsDayStr = isNe ? toNepaliDigits(bs.day) : String(bs.day);
            const bsMonthShort = isNe ? BS_MONTH_NAMES_NE[bs.month] : BS_MONTH_NAMES_EN[bs.month].slice(0, 3);
            const showBSMonth = bs.day === 1;
            return (
              <div key={idx} className={`${styles.cell} ${isToday ? styles.today : ""}`}>
                <span className={styles.dayNum}>
                  {isNe ? toNepaliDigits(day) : day}
                </span>
                <span className={styles.daySub}>
                  {showBSMonth ? `${bsDayStr} ${bsMonthShort}` : bsDayStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderBSCalendar() {
    const daysInMonth = getDaysInBSMonth(bsYear, bsMonth);
    const firstDay = getFirstWeekdayOfBSMonth(bsYear, bsMonth);
    const monthName = isNe ? BS_MONTH_NAMES_NE[bsMonth] : BS_MONTH_NAMES_EN[bsMonth];
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className={styles.calWrap}>
        <div className={styles.monthHeader}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">‹</button>
          <div className={styles.monthTitle}>
            <span className={styles.monthName}>
              {monthName} {isNe ? toNepaliDigits(bsYear) : bsYear}
            </span>
            <span className={styles.monthSub}>
              {isNe ? `${toNepaliDigits(bsYear)} बि.सं.` : `${bsYear} BS`}
            </span>
          </div>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">›</button>
        </div>

        <div className={styles.weekRow}>
          {weekdays.map((d) => <div key={d} className={styles.weekDay}>{d}</div>)}
        </div>

        <div className={styles.grid}>
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className={styles.empty} />;
            const isToday = bsYear === todayBS.year && bsMonth === todayBS.month && day === todayBS.day;
            const adDateFixed = bsToAD(bsYear, bsMonth, day);
            const adDayNum = adDateFixed.getDate();
            const showADMonth = adDayNum === 1;
            const adMonthShort = AD_MONTH_NAMES_EN[adDateFixed.getMonth()].slice(0, 3);
            const adStr = showADMonth ? `${adDayNum} ${adMonthShort}` : String(adDayNum);
            return (
              <div key={idx} className={`${styles.cell} ${isToday ? styles.today : ""}`}>
                <span className={styles.dayNum}>
                  {isNe ? toNepaliDigits(day) : day}
                </span>
                <span className={styles.daySub}>{adStr}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.outer}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {isNe ? "पात्रो" : "Calendar"}
        </h1>
        <p className={styles.heroDesc}>
          {isNe
            ? "नेपाली (बिक्रम संवत) र अंग्रेजी (ग्रेगोरियन) पात्रो"
            : "Bikram Sambat (BS) & Gregorian (AD) Calendar"}
        </p>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${mode === "ad" ? styles.tabActive : ""}`}
          onClick={() => setMode("ad")}
        >
          {isNe ? "अंग्रेजी पात्रो (AD)" : "English Calendar (AD)"}
        </button>
        <button
          className={`${styles.tab} ${mode === "bs" ? styles.tabActive : ""}`}
          onClick={() => setMode("bs")}
        >
          {isNe ? "नेपाली पात्रो (बि.सं.)" : "Nepali Calendar (BS)"}
        </button>
        <button className={styles.todayBtn} onClick={goToday}>
          {isNe ? "आज" : "Today"}
        </button>
      </div>

      <div className={styles.calContainer}>
        {mode === "ad" ? renderADCalendar() : renderBSCalendar()}

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} />
            {isNe
              ? (mode === "ad" ? "सानो अंकले बि.सं. मिति देखाउँछ" : "सानो अंकले AD मिति देखाउँछ")
              : (mode === "ad" ? "Small number shows BS date equivalent" : "Small number shows AD date equivalent")
            }
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendToday}`} />
            {isNe ? "आजको मिति" : "Today"}
          </div>
        </div>
      </div>

      <div className={styles.convCard}>
        <h2 className={styles.convTitle}>
          {isNe ? "आजको मिति" : "Today's Date"}
        </h2>
        <div className={styles.convRow}>
          <div className={styles.convItem}>
            <span className={styles.convLabel}>{isNe ? "अंग्रेजी (AD)" : "English (AD)"}</span>
            <span className={styles.convValue}>
              {AD_MONTH_NAMES_EN[td.month]} {td.day}, {td.year}
            </span>
          </div>
          <div className={styles.convDivider}>⇌</div>
          <div className={styles.convItem}>
            <span className={styles.convLabel}>{isNe ? "नेपाली (बि.सं.)" : "Nepali (BS)"}</span>
            <span className={styles.convValue}>
              {isNe
                ? `${BS_MONTH_NAMES_NE[todayBS.month]} ${toNepaliDigits(todayBS.day)}, ${toNepaliDigits(todayBS.year)}`
                : `${BS_MONTH_NAMES_EN[todayBS.month]} ${todayBS.day}, ${todayBS.year}`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import styles from "./DateTimeClock.module.css";

export default function DateTimeClock() {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
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
  }, []);

  if (!display) return null;
  return <p className={styles.clock}>{display}</p>;
}

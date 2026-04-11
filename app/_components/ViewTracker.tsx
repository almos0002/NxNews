"use client";

import { useEffect, useRef } from "react";

interface Props {
  type: "article" | "page" | "video";
  id: string;
  onViewCounted?: (views: number) => void;
}

export default function ViewTracker({ type, id, onViewCounted }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    })
      .then((r) => r.json())
      .then((data: { views?: number }) => {
        if (onViewCounted && data.views !== undefined) {
          onViewCounted(data.views);
        }
      })
      .catch(() => {});
  }, [type, id, onViewCounted]);

  return null;
}

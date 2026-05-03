"use client";

import { useEffect, useReducer } from "react";

const filled = new Set<string>();
const subs = new Map<string, Set<() => void>>();

function notify(id: string) {
  subs.get(id)?.forEach((cb) => cb());
}

export function markTranslateFilled(id: string) {
  filled.add(id);
  notify(id);
}

export function clearTranslateFilled(id: string) {
  if (filled.delete(id)) notify(id);
}

export function isTranslateFilled(id: string): boolean {
  return filled.has(id);
}

function subscribe(id: string, cb: () => void): () => void {
  if (!subs.has(id)) subs.set(id, new Set());
  subs.get(id)!.add(cb);
  return () => {
    subs.get(id)?.delete(cb);
  };
}

export function useTranslateFilled(id: string | undefined): boolean {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!id) return;
    return subscribe(id, force);
  }, [id]);
  return id ? filled.has(id) : false;
}

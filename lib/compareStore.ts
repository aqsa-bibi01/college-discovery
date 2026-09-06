"use client";

// Lightweight client-side store for the "compare" basket.
// Uses localStorage since this is a real browser app (not a Claude artifact).
const KEY = "pathfinder:compare";
const MAX_COMPARE = 3;

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleCompareId(id: string): string[] {
  const current = getCompareIds();
  let next: string[];
  if (current.includes(id)) {
    next = current.filter((x) => x !== id);
  } else {
    if (current.length >= MAX_COMPARE) {
      next = [...current.slice(1), id];
    } else {
      next = [...current, id];
    }
  }
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("compare-updated"));
  return next;
}

export function clearCompare() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("compare-updated"));
}

export { MAX_COMPARE };

import { useSyncExternalStore } from "react";

const THRESHOLD = 40;

// Matches the header's height change. The header swaps height for margin, so the
// page keeps its length and scrolling past THRESHOLD can't flip the state back.
export const COLLAPSE_DISTANCE = 144;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useCompactHeader() {
  return useSyncExternalStore(
    subscribe,
    () => prefersReducedMotion() || window.scrollY > THRESHOLD,
    () => false,
  );
}

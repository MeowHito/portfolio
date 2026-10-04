"use client";

import { useMediaQuery } from "./useMediaQuery";

/** True when the user asked the OS to reduce motion. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

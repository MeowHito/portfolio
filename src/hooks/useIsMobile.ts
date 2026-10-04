"use client";

import { breakpoints } from "@/lib/tokens";
import { useMediaQuery } from "./useMediaQuery";

/** True below the tablet breakpoint (768px). */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
}

/** True on devices without a fine hover-capable pointer (touch). */
export function useIsTouch() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}

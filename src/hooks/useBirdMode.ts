"use client";

import { useSyncExternalStore } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";

/**
 * - "webgl":  full Three.js bird
 * - "static": inline SVG bird at the perch (reduced motion / ≤4 CPU cores)
 * - "none":   viewports under 375px
 */
export type BirdMode = "webgl" | "static" | "none";

const noop = () => () => {};

export function useBirdMode(): BirdMode {
  const reduced = useReducedMotion();
  const tiny = useMediaQuery("(max-width: 374px)");
  const lowEnd = useSyncExternalStore(
    noop,
    () => (navigator.hardwareConcurrency ?? 8) <= 4,
    () => false,
  );
  if (tiny) return "none";
  if (reduced || lowEnd) return "static";
  return "webgl";
}

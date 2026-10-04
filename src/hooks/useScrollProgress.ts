"use client";

import { useScrollStore, type ScrollSection } from "@/lib/scroll";

/**
 * Reactive read of a section's scroll progress (0–1).
 * Re-renders on every change — fine for DOM UI. Inside useFrame, read
 * `useScrollStore.getState().progress[section]` instead to avoid renders.
 */
export function useScrollProgress(section: ScrollSection) {
  return useScrollStore((s) => s.progress[section]);
}

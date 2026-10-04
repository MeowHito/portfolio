"use client";

import type Lenis from "lenis";
import { create } from "zustand";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Shared scroll state.
 *
 * Architectural rule: each section owns ONE GSAP ScrollTrigger timeline and
 * writes its normalized progress (0–1) here. The Three.js bird reads these
 * values inside useFrame via `useScrollStore.getState()` and never creates its
 * own ScrollTriggers — so DOM text and the bird stay in lockstep.
 */
export type ScrollSection = "hero" | "about" | "projects";

type ScrollState = {
  progress: Record<ScrollSection, number>;
  /** Lenis velocity (px/frame, signed). Drives bird flap intensity. */
  velocity: number;
  /** Section id currently at the viewport centre (for the nav underline). */
  activeSection: string | null;
  /** Scroll Y to restore after a locale switch remounts the page. */
  pendingScrollY: number | null;
  /**
   * Where the bird lands: top-right of the final "U" of CHUNU, in viewport px
   * while the hero is pinned. Measured by the Hero, re-measured on resize.
   */
  perch: Perch | null;

  setProgress: (section: ScrollSection, value: number) => void;
  setVelocity: (value: number) => void;
  setActiveSection: (id: string | null) => void;
  setPendingScrollY: (y: number | null) => void;
  setPerch: (perch: Perch | null) => void;
};

export type Perch = {
  x: number;
  y: number;
  /** Height of the U glyph box — used to size the bird. */
  size: number;
};

export const useScrollStore = create<ScrollState>((set) => ({
  progress: { hero: 0, about: 0, projects: 0 },
  velocity: 0,
  activeSection: null,
  pendingScrollY: null,
  perch: null,

  setProgress: (section, value) =>
    set((s) => ({ progress: { ...s.progress, [section]: value } })),
  setVelocity: (velocity) => set({ velocity }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setPendingScrollY: (pendingScrollY) => set({ pendingScrollY }),
  setPerch: (perch) => set({ perch }),
}));

/**
 * Wire a Lenis instance into GSAP:
 *  - GSAP's ticker drives Lenis (one RAF loop for the whole site)
 *  - every Lenis scroll updates ScrollTrigger and the store's velocity
 * Returns a cleanup function.
 */
export function syncLenisWithGsap(lenis: Lenis) {
  const onTick = (time: number) => lenis.raf(time * 1000);
  const onScroll = (l: Lenis) => {
    ScrollTrigger.update();
    useScrollStore.getState().setVelocity(l.velocity);
  };

  lenis.on("scroll", onScroll);
  gsap.ticker.add(onTick);
  // Lenis already smooths; GSAP's lag smoothing would fight it.
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off("scroll", onScroll);
    gsap.ticker.remove(onTick);
    gsap.ticker.lagSmoothing(500, 33);
  };
}

/** Kill every ScrollTrigger (used on route change / unmount). */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

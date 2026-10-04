"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { syncLenisWithGsap } from "@/lib/scroll";

/** Hooks the Lenis instance into GSAP's ticker once Lenis is ready. */
function LenisGsapBridge() {
  const lenis = useLenis();
  useEffect(() => (lenis ? syncLenisWithGsap(lenis) : undefined), [lenis]);
  return null;
}

/**
 * Global inertia scroll. Mounted in the root layout so it survives locale
 * switches. With reduced motion, wheel smoothing is off (native scroll).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false, // GSAP's ticker drives Lenis (see syncLenisWithGsap)
        lerp: 0.1,
        smoothWheel: !reduced,
        syncTouch: false,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}

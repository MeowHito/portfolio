"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollStore, type ScrollSection } from "@/lib/scroll";
import { motion } from "@/lib/tokens";

/**
 * DOM side of the bird's travel after the hero: one scrubbed timeline each
 * for About and Projects that writes progress (0–1) to the store. The canvas
 * only reads these values. The ranges are contiguous — About ends exactly
 * where Projects begins — so the bird hands off without a jump.
 */
export function ScrollRig() {
  useGSAP(() => {
    const track = (id: string, section: ScrollSection, end: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end, scrub: motion.scrub },
        onUpdate: () => useScrollStore.getState().setProgress(section, proxy.p),
      });
    };
    track("about", "about", "bottom bottom");
    // Bird is gone by the time Experience reaches mid-screen.
    track("projects", "projects", "bottom center");
  });
  return null;
}

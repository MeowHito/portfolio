"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/lib/scroll";

/**
 * After a locale switch the [locale] subtree remounts. Restore the scroll
 * position saved by LangToggle once the new page (and its pins) exist.
 */
export function ScrollRestorer() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const { pendingScrollY, setPendingScrollY } = useScrollStore.getState();
    if (pendingScrollY == null) return;

    // Wait one frame so new ScrollTriggers have measured the layout.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis.scrollTo(pendingScrollY, { immediate: true, force: true });
      setPendingScrollY(null);
    });
    return () => cancelAnimationFrame(id);
  }, [lenis]);

  return null;
}

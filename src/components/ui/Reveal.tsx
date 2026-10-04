"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, useGSAP } from "@/lib/gsap";
import { motion } from "@/lib/tokens";

/** Fades children up 24px when they enter the viewport (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** If set, animates direct children one after another instead of the wrapper. */
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const el = ref.current!;
      gsap.from(stagger ? el.children : el, {
        opacity: 0,
        y: 24,
        duration: motion.durBase,
        ease: motion.easeEnter,
        delay,
        stagger,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

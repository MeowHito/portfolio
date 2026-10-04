"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { motion } from "@/lib/tokens";

type Props = { index: number; label: string; title: string; headingId: string };

/**
 * "01 — About" label + section title. On entering the viewport the title
 * lines rise out of a mask. Splits by line (not char) so Thai stays intact.
 */
export function SectionHeader({ index, label, title, headingId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const el = ref.current!;
      const trigger = { trigger: el, start: "top 85%", once: true };
      gsap.from(el.querySelector(".text-label"), {
        opacity: 0, x: -12, duration: motion.durBase, ease: motion.easeEnter, scrollTrigger: trigger,
      });
      SplitText.create(el.querySelector("h2"), {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110, duration: motion.durLong, ease: motion.easeEnter, stagger: 0.08,
            scrollTrigger: trigger,
          }),
      });
    },
    { scope: ref, dependencies: [reduced, title] },
  );

  return (
    <div ref={ref}>
      <p className="text-label mb-6">
        {String(index).padStart(2, "0")} — {label}
      </p>
      <h2 id={headingId} className="text-section">
        {title}
      </h2>
    </div>
  );
}

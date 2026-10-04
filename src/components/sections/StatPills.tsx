"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, useGSAP } from "@/lib/gsap";

type Stat = { value: number; from?: number; suffix?: string; label: string };

/** Small stat pills whose numbers count up when scrolled into view. */
export function StatPills({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      ref.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        const obj = { v: Number(el.dataset.from ?? 0) };
        el.textContent = String(Math.round(obj.v));
        gsap.to(obj, {
          v: to,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        });
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <ul ref={ref} className="mt-10 flex flex-wrap gap-3">
      {stats.map((s) => (
        <li
          key={s.label}
          className="flex items-baseline gap-2 rounded-full border border-line bg-surface/60 px-4 py-2"
        >
          <span className="font-display text-lg font-semibold tabular-nums text-ink">
            <span data-count={s.value} data-from={s.from}>
              {s.value}
            </span>
            {s.suffix}
          </span>
          <span className="text-sm text-ink-soft">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

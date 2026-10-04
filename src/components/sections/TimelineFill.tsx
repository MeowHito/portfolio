"use client";

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Fills each timeline dot as it passes the viewport centre (reverses on scroll-up). */
export function TimelineFill({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      ref.current!.querySelectorAll<HTMLElement>(".tl-dot").forEach((dot) =>
        ScrollTrigger.create({
          trigger: dot,
          start: "top center",
          toggleClass: { targets: dot, className: "is-on" },
          end: "max",
        }),
      );
    },
    { scope: ref },
  );
  return <div ref={ref}>{children}</div>;
}

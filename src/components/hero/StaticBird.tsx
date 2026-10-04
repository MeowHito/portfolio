"use client";

import { useScrollStore } from "@/lib/scroll";

/**
 * Flat SVG eagle perched on the final "U" — used for reduced motion and
 * low-end devices instead of the WebGL canvas.
 */
export function StaticBird() {
  const perch = useScrollStore((s) => s.perch);
  if (!perch) return null;

  const w = Math.max(56, perch.size * 0.9);
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 80"
      width={w}
      height={(w * 80) / 120}
      className="pointer-events-none absolute"
      style={{ left: perch.x - w * 0.55, top: perch.y - (w * 80) / 120 + 2 }}
    >
      <ellipse cx="60" cy="78" rx="34" ry="4" fill="var(--glow)" opacity="0.35" />
      {/* white wedge tail */}
      <path d="M28 52 L4 58 L6 66 L30 60 Z" fill="#F4F1EA" />
      {/* body + folded wing */}
      <path d="M24 56 C28 38 56 30 80 36 C92 42 92 58 78 66 C60 74 34 70 24 56 Z" fill="#6E4C34" />
      <path d="M34 44 C52 36 74 40 80 50 C66 62 40 66 18 64 C24 56 28 50 34 44 Z" fill="#4A3424" />
      {/* white head + neck */}
      <path d="M72 38 C74 24 88 18 98 24 C104 28 104 36 98 40 C92 44 80 46 72 38 Z" fill="#F4F1EA" />
      <path d="M86 26 L97 28" stroke="#C9C3B8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="92" cy="30" r="1.8" fill="#2A1A0E" />
      {/* hooked beak */}
      <path d="M98 27 C106 26 112 29 112 35 C110 33 106 33 102 36 L98 36 Z" fill="#F0B53A" />
      {/* feathered legs + talons */}
      <path d="M52 64 C50 70 54 72 58 72 M62 64 C60 70 64 72 68 72" stroke="#6E4C34" strokeWidth="6" strokeLinecap="round" />
      <path d="M56 72 V78 M66 72 V78" stroke="#F0B53A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

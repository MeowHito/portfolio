"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/lib/scroll";
import { NAV_SOLID_AFTER } from "@/lib/tokens";
import { LangToggle } from "./LangToggle";

const LINKS = ["about", "projects", "experience", "contact"] as const;
/** Every section the active-underline can track (skills maps to none). */
const TRACKED = ["about", "projects", "experience", "skills", "contact"];

export function Nav() {
  const t = useTranslations("nav");
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const active = useScrollStore((s) => s.activeSection);
  const setActive = useScrollStore((s) => s.setActiveSection);
  const [solid, setSolid] = useState(false);

  // Transparent over the hero → frosted after 80px.
  useLenis(({ scroll }) => setSolid(scroll > NAV_SOLID_AFTER));
  useEffect(() => setSolid(window.scrollY > NAV_SOLID_AFTER), []);

  // Active section = whichever section crosses the viewport centre line.
  // IntersectionObserver is unaffected by GSAP pin spacers.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    const els = TRACKED.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    );
    els.forEach((el) => observer.observe(el));

    const top = document.getElementById("top");
    const topObserver = new IntersectionObserver(
      ([e]) => e.isIntersecting && setActive(null),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    if (top) topObserver.observe(top);

    return () => {
      observer.disconnect();
      topObserver.disconnect();
    };
  }, [setActive]);

  const scrollTo = (target: string | number) => (e: React.MouseEvent) => {
    if (!lenis) return; // fall back to native anchor jump
    e.preventDefault();
    lenis.scrollTo(target, { immediate: reduced, duration: 1.4 });
    if (typeof target === "string") history.replaceState(null, "", target);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        solid
          ? "border-b border-line/70 bg-surface/80 backdrop-blur-[12px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label={t("primary")}
        className="container-x flex h-[var(--nav-h)] items-center justify-between"
      >
        <a
          href="#top"
          onClick={scrollTo(0)}
          aria-label={t("home")}
          className="font-display text-lg font-semibold tracking-[-0.03em] text-ink"
        >
          NC
        </a>

        <div className="flex items-center gap-6 md:gap-8">
          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((id) => (
              <li key={id} className="relative">
                <a
                  href={`#${id}`}
                  onClick={scrollTo(`#${id}`)}
                  aria-current={active === id ? "true" : undefined}
                  className={`block py-1 text-sm transition-colors duration-300 ${
                    active === id ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t(id)}
                </a>
                {active === id && (
                  <motion.span
                    layoutId="nav-underline"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </li>
            ))}
          </ul>
          <LangToggle />
        </div>
      </nav>
    </header>
  );
}

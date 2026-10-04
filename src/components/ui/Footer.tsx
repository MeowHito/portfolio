"use client";

import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Footer. The `drip` wordmark effect comes with the kinetic-type phase. */
export function Footer() {
  const t = useTranslations("footer");
  const lenis = useLenis();
  const reduced = useReducedMotion();

  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-10 py-16 md:flex-row md:items-end md:justify-between">
        <p className="font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-none tracking-[-0.03em]">
          {t("wordmark")}
        </p>
        <div className="flex flex-col gap-3 text-sm text-ink-soft md:items-end">
          <a
            href="#top"
            onClick={(e) => {
              if (!lenis) return;
              e.preventDefault();
              lenis.scrollTo(0, { immediate: reduced, duration: 1.8 });
            }}
            className="inline-flex items-center gap-1.5 text-ink hover:text-primary"
          >
            {t("top")} <ArrowUp size={14} strokeWidth={1.5} aria-hidden />
          </a>
          <p>{t("built")}</p>
          <p>© 2026</p>
        </div>
      </div>
    </footer>
  );
}

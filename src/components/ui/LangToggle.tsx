"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useScrollStore } from "@/lib/scroll";

const LABELS: Record<Locale, string> = { en: "EN", th: "TH" };
const NAMES: Record<Locale, string> = { en: "English", th: "ภาษาไทย" };

/**
 * EN | TH pill with a sliding indicator. Switching locale keeps the scroll
 * position and never touches the root layout (canvas + Lenis persist).
 */
export function LangToggle() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  // Optimistic so the indicator slides immediately, before the route swaps.
  const [active, setActive] = useState<Locale>(locale);

  const switchTo = (next: Locale) => {
    if (next === active) return;
    setActive(next);
    useScrollStore.getState().setPendingScrollY(window.scrollY);
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="relative flex items-center rounded-full border border-line bg-surface/70 p-0.5 font-mono text-[0.6875rem] tracking-[0.08em]"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={active === l}
          aria-label={NAMES[l]}
          onClick={() => switchTo(l)}
          className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-300 ${
            active === l ? "text-surface" : "text-ink-soft hover:text-ink"
          }`}
        >
          {active === l && (
            <motion.span
              layoutId="lang-indicator"
              className="absolute inset-0 -z-10 rounded-full bg-ink"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

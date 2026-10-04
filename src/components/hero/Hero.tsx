"use client";

import { useTranslations } from "next-intl";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useBirdMode } from "@/hooks/useBirdMode";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { splitWordsGraphemes } from "@/lib/grapheme";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollStore } from "@/lib/scroll";
import { motion } from "@/lib/tokens";
import {
  MATCHED_WORD,
  MorphingTitle,
  NAME_TO_WORD,
} from "./MorphingTitle";
import { StaticBird } from "./StaticBird";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#";
const SCRAMBLE_STEPS = 6;

/** The load entrance plays once per visit, not again on a locale switch. */
let introPlayed = false;

/**
 * Scroll-scrubbed scramble on one char. `dir: "out"` shows random glyphs
 * then the char fades; `dir: "in"` cycles glyphs and resolves to the real one.
 * Glyph choice is deterministic per step, so it holds still when scroll stops
 * and reverses cleanly.
 */
function addScramble(
  tl: gsap.core.Timeline,
  ch: HTMLElement,
  seed: number,
  at: number,
  duration: number,
  dir: "in" | "out",
) {
  const real = ch.querySelector<HTMLElement>(".ch-real")!;
  const glyph = ch.querySelector<HTMLElement>(".ch-glyph")!;
  const proxy = { p: 0 };
  const render = () => {
    const showReal = dir === "out" ? proxy.p <= 0 : proxy.p >= 1;
    real.style.opacity = showReal ? "1" : "0";
    if (showReal) {
      glyph.textContent = "";
    } else {
      const step = Math.min(SCRAMBLE_STEPS - 1, Math.floor(proxy.p * SCRAMBLE_STEPS));
      glyph.textContent = GLYPHS[(seed * 31 + step * 17) % GLYPHS.length];
    }
  };
  render();
  tl.to(proxy, { p: 1, duration, ease: "none", onUpdate: render }, at);
}

/**
 * Hero — 400vh (250vh mobile) scroll story with a sticky viewport.
 *
 * Progress map (one timeline, total duration = 1):
 *   0.00–0.30  PORTFOLIO weight 800 → 500 (bird flies in)
 *   0.25–0.55  morph PORTFOLIO → NARONGPOL CHUNU
 *   0.50–0.65  bird perches on the final U          (bird reads progress)
 *   0.65–0.85  tagline types in, scroll cue fades
 *   0.85–1.00  bird lifts off, hero releases
 *
 * Uses CSS sticky rather than ScrollTrigger `pin` — same visual result, no
 * pin-spacer layout shift, and the reserved height is in the SSR markup.
 */
export function Hero() {
  const t = useTranslations("hero");
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const birdMode = useBirdMode();
  const root = useRef<HTMLElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  const tagline = t("tagline");
  const taglineWords = useMemo(() => splitWordsGraphemes(tagline), [tagline]);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Rebuild measurements on width changes (ignore mobile URL-bar height jitter).
  useEffect(() => {
    let lastW = window.innerWidth;
    let timer: number;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = window.setTimeout(() => setLayoutKey((k) => k + 1), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  /** Perch = top-right stem of the last U, relative to the sticky viewport. */
  const measurePerch = () => {
    const el = root.current;
    if (!el) return;
    const inner = el.querySelector<HTMLElement>(".hero-inner")!;
    const chars = el.querySelectorAll<HTMLElement>(".hero-name .ch");
    const u = chars[chars.length - 1].getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    useScrollStore.getState().setPerch({
      x: u.right - u.width * 0.2 - ir.left,
      y: u.top + u.height * 0.13 - ir.top,
      size: u.height,
    });
  };

  // Phase 0 — load entrance: letters rise from y:110% behind a clip.
  useGSAP(
    () => {
      const word = root.current!.querySelector<HTMLElement>(".hero-word")!;
      const sub = root.current!.querySelectorAll(".hero-sub, .hero-cue");
      const chars = word.querySelectorAll(".ch-in");
      if (reduced || introPlayed) {
        gsap.set(chars, { clearProps: "transform" });
        word.classList.add("is-ready");
        return;
      }
      gsap
        .timeline({
          onComplete: () => {
            introPlayed = true; // set on completion so StrictMode's re-run still plays it
            word.classList.add("is-ready");
          },
        })
        // Explicit y: 0 — otherwise GSAP folds the CSS pre-state into y.
        .fromTo(
          chars,
          { yPercent: 110, y: 0 },
          { yPercent: 0, y: 0, duration: 0.9, ease: motion.easeEnter, stagger: 0.04 },
          0.15,
        )
        .from(sub, { opacity: 0, y: 12, duration: 0.8, ease: motion.easeEnter, stagger: 0.1 }, 0.7);
    },
    { scope: root, dependencies: [reduced] },
  );

  // Phases 1–5 — one scrubbed timeline; progress goes to the store for the bird.
  useGSAP(
    () => {
      if (!fontsReady) return;
      const el = root.current!;
      // Clear scramble state left by a previous build (resize / breakpoint change).
      el.querySelectorAll<HTMLElement>(".ch-real").forEach((r) => (r.style.opacity = ""));
      el.querySelectorAll<HTMLElement>(".ch-glyph").forEach((g) => (g.textContent = ""));
      measurePerch();
      if (reduced) {
        useScrollStore.getState().setProgress("hero", 0.75); // "resting" pose
        return;
      }

      const word = el.querySelector<HTMLElement>(".hero-word")!;
      const wordChars = gsap.utils.toArray<HTMLElement>(".hero-word .ch", el);
      const nameChars = gsap.utils.toArray<HTMLElement>(".hero-name .ch", el);
      const tagChars = gsap.utils.toArray<HTMLElement>(".hero-tagline .tg", el);
      const cue = el.querySelector(".hero-cue");

      // FLIP source rects: measure PORTFOLIO at its morph-time weight.
      word.style.setProperty("--wght", "500");
      const from = wordChars.map((c) => c.getBoundingClientRect());
      word.style.removeProperty("--wght");
      const to = nameChars.map((c) => c.getBoundingClientRect());

      const setProgress = useScrollStore.getState().setProgress;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: motion.scrub,
        },
        onUpdate() {
          setProgress("hero", this.progress());
        },
      });
      tl.set({}, {}, 1); // fix total duration at 1 so positions = progress

      // Phase 1: weight shift signals change.
      tl.to(word, { "--wght": 500, duration: 0.3, ease: "power1.inOut" }, 0);

      // Phase 2: morph.
      NAME_TO_WORD.forEach((wi, ni) => {
        const target = nameChars[ni];
        if (wi >= 0) {
          const a = from[wi];
          const b = to[ni];
          tl.to(
            wordChars[wi],
            {
              x: b.left - a.left,
              y: b.top - a.top,
              scale: b.height / a.height,
              transformOrigin: "0 0",
              duration: 0.25,
              ease: motion.easeMorph,
            },
            0.25 + ni * 0.004,
          );
          // Crossfade into the 700-weight glyph sitting at the same spot.
          tl.to(wordChars[wi], { opacity: 0, duration: 0.05 }, 0.49);
          tl.to(target, { opacity: 1, duration: 0.05 }, 0.49);
        } else {
          const at = 0.3 + ni * 0.012;
          tl.to(target, { opacity: 1, duration: mobile ? 0.08 : 0.03 }, at);
          if (!mobile) addScramble(tl, target, ni + 7, at, 0.13, "in");
        }
      });
      wordChars.forEach((c, wi) => {
        if (MATCHED_WORD.has(wi)) return;
        const at = 0.25 + wi * 0.015;
        if (!mobile) addScramble(tl, c, wi, at, 0.1, "out");
        tl.to(c, { opacity: 0, duration: 0.05 }, at + (mobile ? 0 : 0.07));
      });

      // Phase 4: tagline types in, scroll cue leaves.
      tl.to(cue, { opacity: 0, duration: 0.06 }, 0.62);
      tl.to(
        tagChars,
        { opacity: 1, duration: 0.001, stagger: 0.17 / Math.max(1, tagChars.length) },
        0.65,
      );
    },
    {
      scope: root,
      dependencies: [fontsReady, reduced, mobile, layoutKey, taglineWords],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={root}
      id="top"
      className={`hero relative ${reduced ? "h-[100svh]" : "h-[400vh] max-md:h-[250vh]"}`}
    >
      <h1 className="sr-only">Narongpol Chunu — {t("subtitle")}</h1>

      <div className="hero-inner sticky top-0 flex h-[100svh] flex-col items-center justify-center px-[var(--gutter)]">
        <MorphingTitle settled={reduced} />

        <p className="hero-sub mt-8 text-center text-ink-soft">{t("subtitle")}</p>
        <p
          className="hero-tagline prose-measure mt-3 min-h-[3.4em] text-center text-ink md:text-lg"
          data-settled={reduced}
        >
          {taglineWords.map((word, wi) => (
            <Fragment key={wi}>
              <span className="whitespace-nowrap">
                {word.map((c, ci) => (
                  <span key={ci} className="tg">
                    {c}
                  </span>
                ))}
              </span>
              <wbr />
            </Fragment>
          ))}
        </p>

        {/* Scroll cue: a 1px line that grows and shrinks + the word "scroll" */}
        <div
          aria-hidden
          className="hero-cue absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          style={reduced ? { display: "none" } : undefined}
        >
          <span className="text-label">{t("scroll")}</span>
          <span className="relative block h-12 w-px overflow-hidden bg-line">
            <span className="scroll-cue-line absolute inset-0 bg-ink" />
          </span>
        </div>

        {birdMode === "static" && <StaticBird />}
      </div>
    </section>
  );
}

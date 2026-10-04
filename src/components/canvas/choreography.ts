import { CatmullRomCurve3, LineCurve3, Vector3, type Curve } from "three";

/**
 * Pure functions: scroll progress → bird pose.
 *
 * Coordinates are normalized to the viewport with the origin at its centre:
 * x ∈ [-0.5, 0.5] left→right, y ∈ [-0.5, 0.5] bottom→top. The bird's origin
 * is its feet, so (x, y) is exactly where it stands when perched.
 *
 * Each stage ends where the next begins, so the bird never jumps.
 */
export type Pose = {
  x: number;
  y: number;
  /** Multiplier on the base bird size. */
  scale: number;
  /** Wing flap amplitude (radians) and frequency (Hz). */
  amp: number;
  freq: number;
  /** 0 = wings spread, 1 = folded against the body. */
  fold: number;
  /** Perch glow opacity 0–1. */
  glow: number;
  /** Roll (radians) — banking into a turn. */
  bank: number;
  /** True while resting on the U (breathing + head look-around). */
  resting: boolean;
  /** Gliding: flap only if the visitor is scrolling fast. */
  velocityFlap: boolean;
  visible: boolean;
};

export type Point = { x: number; y: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;

const START: Point = { x: 0.7, y: 0.18 }; // off-screen right
const ABOUT_START: Point = { x: 0.3, y: 0.3 };
// About text sits left, portrait right: the bird stays in the right column.
const ABOUT_END: Point = { x: 0.14, y: 0.32 };
// Right margin, beside the screenshot (text column is on the left).
const PROJECTS_HOVER: Point = { x: 0.43, y: 0.08 };
const EXIT: Point = { x: -0.78, y: 0.46 };

/** Hover point above-right of the perch, where the bird circles during the morph. */
export const hoverPoint = (perch: Point): Point => ({ x: perch.x + 0.06, y: perch.y + 0.16 });

/** S-curve entry through 4 points (straight line on mobile). */
export function makeEntryCurve(perch: Point, mobile: boolean): Curve<Vector3> {
  const end = hoverPoint(perch);
  if (mobile) return new LineCurve3(new Vector3(START.x, START.y, 0), new Vector3(end.x, end.y, 0));
  return new CatmullRomCurve3(
    [
      new Vector3(START.x, START.y, 0),
      new Vector3(0.38, 0.34, 0),
      new Vector3(0.14, 0.08, 0),
      new Vector3(end.x, end.y, 0),
    ],
    false,
    "centripetal",
  );
}

const base = (p: Point): Pose => ({
  x: p.x,
  y: p.y,
  scale: 1,
  amp: 0.8,
  freq: 3,
  fold: 0,
  glow: 0,
  bank: 0,
  resting: false,
  velocityFlap: false,
  visible: true,
});

const tmp = new Vector3();

export function heroPose(p: number, perch: Point, curve: Curve<Vector3>): Pose {
  const hover = hoverPoint(perch);

  // 1 — enter from the far right, growing 0.6 → 1.0 as it approaches.
  if (p < 0.3) {
    const s = seg(p, 0, 0.3);
    curve.getPoint(smooth(s), tmp);
    return { ...base({ x: tmp.x, y: tmp.y }), scale: lerp(0.6, 1, s), amp: 0.9, visible: p > 0.001 };
  }

  // 2 — hover in a small figure-eight while the title morphs.
  if (p < 0.5) {
    const s = seg(p, 0.3, 0.5);
    return {
      ...base({
        x: hover.x + Math.sin(s * Math.PI * 2) * 0.012,
        y: hover.y + Math.sin(s * Math.PI * 4) * 0.008,
      }),
      amp: 0.75,
    };
  }

  // 3 — decelerate onto the U; flap dies out, wings fold, glow appears.
  if (p < 0.65) {
    const e = easeOut(seg(p, 0.5, 0.65));
    return {
      ...base({ x: lerp(hover.x, perch.x, e), y: lerp(hover.y, perch.y, e) }),
      amp: 0.75 * (1 - seg(p, 0.5, 0.62)),
      fold: seg(p, 0.6, 0.65),
      glow: seg(p, 0.58, 0.65),
      resting: p > 0.62,
    };
  }

  // 4 — rest.
  if (p < 0.85) {
    return { ...base(perch), amp: 0, fold: 1, glow: 1, resting: true };
  }

  // 5 — lift off with strong flaps toward the About path.
  const s = seg(p, 0.85, 1);
  return {
    ...base({ x: lerp(perch.x, ABOUT_START.x, smooth(s)), y: lerp(perch.y, ABOUT_START.y, easeOut(s)) }),
    amp: 1.2,
    freq: 4,
    fold: 1 - seg(p, 0.85, 0.88),
    glow: 1 - seg(p, 0.85, 0.9),
  };
}

/** About — shallow right→left arc across the top third of the right column; glides when idle. */
export function aboutPose(p: number): Pose {
  return {
    ...base({
      x: lerp(ABOUT_START.x, ABOUT_END.x, p),
      y: lerp(ABOUT_START.y, ABOUT_END.y, p) + Math.sin(p * Math.PI) * 0.05,
    }),
    velocityFlap: true,
  };
}

/** Projects — hover in the right margin, dip toward each card, then exit left. */
export function projectsPose(p: number, cards = 5): Pose {
  // Turn back to the right margin.
  if (p < 0.12) {
    const s = smooth(seg(p, 0, 0.12));
    return {
      ...base({ x: lerp(ABOUT_END.x, PROJECTS_HOVER.x, s), y: lerp(ABOUT_END.y, PROJECTS_HOVER.y, s) }),
      amp: 0.7,
    };
  }

  // Beside the cards: one dip per card, lazy flaps in between.
  if (p < 0.7) {
    const u = seg(p, 0.12, 0.7) * cards;
    const f = u - Math.floor(u);
    const dip = Math.sin(f * Math.PI) ** 2 * 0.025;
    const between = f > 0.75 || f < 0.15;
    return {
      ...base({ x: PROJECTS_HOVER.x, y: PROJECTS_HOVER.y - dip }),
      amp: between ? 0.55 : 0.12,
      freq: 2,
    };
  }

  // Exit: bank left, shrink 1 → 0.5, flap hard at 5 Hz along a rising curve.
  const s = seg(p, 0.7, 1);
  return {
    ...base({
      x: lerp(PROJECTS_HOVER.x, EXIT.x, easeIn(s) * 0.6 + s * 0.4),
      y: lerp(PROJECTS_HOVER.y, EXIT.y, s * s),
    }),
    scale: lerp(1, 0.5, s),
    amp: 1.1,
    freq: 5,
    bank: s * 0.5,
    visible: s < 0.99,
  };
}

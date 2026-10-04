/**
 * JS mirror of the CSS design tokens in globals.css.
 * Use these in GSAP / Three.js where CSS variables aren't reachable.
 * Keep the two files in sync — CSS is the source of truth.
 */
export const colors = {
  bg: "#0F1828",
  surface: "#16223A",
  ink: "#E7EDF5",
  inkSoft: "#9DABBF",
  primary: "#8DB2E6",
  pastelBlue: "#1F3150",
  pastelMint: "#1E3B37",
  pastelPeach: "#3B2C29",
  pastelLavender: "#2C2A4A",
  line: "#243450",
  glow: "#D6E4F5",
} as const;

/** Paper-craft bird palette (section 2). */
/** Bald eagle palette — warm browns lifted a touch so it reads on the navy bg. */
export const birdColors = {
  body: "#6E4C34",
  wingTop: "#5B3E2A",
  wingUnder: "#8A6A50",
  primaries: "#4A3424",
  white: "#F4F1EA",
  beak: "#F0B53A",
  eye: "#2A1A0E",
} as const;

export type Accent = "mint" | "lavender" | "blue" | "peach";

/** Tailwind class + raw hex for each project accent. */
export const accents: Record<Accent, { bg: string; hex: string }> = {
  mint: { bg: "bg-pastel-mint", hex: colors.pastelMint },
  lavender: { bg: "bg-pastel-lavender", hex: colors.pastelLavender },
  blue: { bg: "bg-pastel-blue", hex: colors.pastelBlue },
  peach: { bg: "bg-pastel-peach", hex: colors.pastelPeach },
};

/** Motion principles (section 3). */
export const motion = {
  easeEnter: "power3.out",
  easeMorph: "expo.inOut",
  durShort: 0.6,
  durBase: 0.8,
  durLong: 1.2,
  /** Every scroll-scrubbed timeline uses this for a slight physical lag. */
  scrub: 1,
} as const;

export const breakpoints = {
  xs: 375,
  md: 768,
  lg: 1024,
  xl: 1440,
  xxl: 1920,
} as const;

/** Nav switches from transparent to frosted after this many px. */
export const NAV_SOLID_AFTER = 80;

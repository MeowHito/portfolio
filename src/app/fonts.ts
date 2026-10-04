import { Bricolage_Grotesque, IBM_Plex_Sans_Thai, Inter } from "next/font/google";

/**
 * Two font families only (display + body); Plex Thai is the Thai cut of the body.
 * Bricolage is loaded as a variable font with its width axis — the
 * kinetic-type effects animate both `wght` and `wdth`.
 */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  variable: "--font-bricolage",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

export const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-thai",
  preload: false, // only needed on /th; avoids an extra preload on /en
});

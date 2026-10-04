import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BirdSceneLoader } from "@/components/canvas/BirdSceneLoader";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { colors } from "@/lib/tokens";
import { display, inter, plexThai } from "./fonts";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  themeColor: colors.bg,
};

/**
 * Root layout — lives OUTSIDE the [locale] segment on purpose, so switching
 * EN ⇄ TH never remounts Lenis or the fixed Three.js bird canvas.
 * The page stays statically rendered; <html lang> is set from the URL before
 * first paint and kept in sync by <HtmlLang> on client navigations.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${inter.variable} ${plexThai.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.lang=location.pathname.split('/')[1]==='th'?'th':'en'",
          }}
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <BirdSceneLoader />
      </body>
    </html>
  );
}

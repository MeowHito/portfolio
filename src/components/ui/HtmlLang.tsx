"use client";

import { useEffect } from "react";

/**
 * The <html> element lives in the root layout (outside [locale]) so the
 * canvas and Lenis survive locale switches. Keep its lang attribute in sync
 * on client-side navigations.
 */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

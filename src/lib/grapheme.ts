/**
 * Split text into user-perceived characters. Thai vowel/tone marks stay
 * attached to their base consonant (a plain split("") would separate them).
 */
export function splitGraphemes(text: string, locale = "th"): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Words → graphemes, for per-character animation that must still wrap.
 * Thai has no spaces; per-char spans would remove all line-break points,
 * so callers render each word as a no-wrap group with breaks between words.
 */
export function splitWordsGraphemes(text: string, locale = "th"): string[][] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: "word" });
    return Array.from(seg.segment(text), (s) => splitGraphemes(s.segment, locale));
  }
  return text.split(/(\s+)/).map((w) => Array.from(w));
}

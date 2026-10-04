/**
 * Two stacked layers in the same grid cell:
 *   - .hero-word  "PORTFOLIO"         (visible first)
 *   - .hero-name  "NARONGPOL / CHUNU" (fades in during the morph)
 * The Hero timeline flies shared letters from the first layer to their slot
 * in the second, and scrambles the rest in/out. Both stay Latin in TH too.
 *
 * Each char is  .ch > .ch-in > (.ch-real + .ch-glyph)
 *   .ch       — FLIP transforms + opacity (scroll timeline)
 *   .ch-in    — load entrance (rise from y:110%)
 *   .ch-glyph — scramble overlay, so random glyphs never reflow the line
 */
export const WORD = "PORTFOLIO";
export const NAME_LINES = ["NARONGPOL", "CHUNU"] as const;
export const NAME_CHARS = NAME_LINES.join("").split("");

/**
 * For every name char, the index of the PORTFOLIO letter that flies into it,
 * or -1 if it scrambles in fresh. Shared: P, O, O, R, L.
 */
export const NAME_TO_WORD: number[] = (() => {
  const used = new Set<number>();
  return NAME_CHARS.map((c) => {
    const i = WORD.split("").findIndex((w, j) => w === c && !used.has(j));
    if (i >= 0) used.add(i);
    return i;
  });
})();

export const MATCHED_WORD = new Set(NAME_TO_WORD.filter((i) => i >= 0));

function Char({ c }: { c: string }) {
  return (
    <span className="ch">
      <span className="ch-in">
        <span className="ch-real">{c}</span>
        <span className="ch-glyph" />
      </span>
    </span>
  );
}

export function MorphingTitle({ settled }: { settled: boolean }) {
  return (
    <div className="hero-stage" aria-hidden>
      <div className="hero-word" data-settled={settled}>
        {WORD.split("").map((c, i) => (
          <Char key={i} c={c} />
        ))}
      </div>
      <div className="hero-name" data-settled={settled}>
        {NAME_LINES.map((line) => (
          <span key={line} className="hero-name-line">
            {line.split("").map((c, i) => (
              <Char key={i} c={c} />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

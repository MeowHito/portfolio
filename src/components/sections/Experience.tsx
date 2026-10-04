import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import { TimelineFill } from "./TimelineFill";

const ITEMS = ["action", "csmju", "edu"] as const;

/** Experience (03) — vertical timeline; dots fill as they cross mid-screen. */
export function Experience() {
  const t = useTranslations("experience");

  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y">
      <div className="container-x">
        <SectionHeader index={3} label={t("label")} title={t("title")} headingId="experience-title" />
        <TimelineFill>
          <ol className="relative mt-14 ml-1.5 max-w-3xl border-l border-line">
            {ITEMS.map((key) => (
              <li key={key} className="relative pb-14 pl-8 last:pb-0 md:pl-12">
                <span
                  aria-hidden
                  className="tl-dot absolute top-1.5 -left-[7px] size-3.5 rounded-full border border-primary bg-bg transition-[background-color,box-shadow] duration-500"
                />
                <Reveal>
                  <p className="text-label">{t(`${key}.period`)}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold md:text-2xl">
                    {t(`${key}.role`)}
                    <span className="font-normal text-ink-soft"> — {t(`${key}.org`)}</span>
                  </h3>
                  <ul className="mt-4 space-y-2 text-ink/85">
                    {(t.raw(`${key}.bullets`) as string[]).map((b) => (
                      <li key={b} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2.5 before:bg-primary">
                        {b}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </TimelineFill>
      </div>
    </section>
  );
}

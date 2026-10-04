import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import { StatPills } from "./StatPills";

/**
 * About (01). Text left, portrait right — the bird glides through the
 * top-right of this section, so the right column stays visually quiet.
 */
export function About() {
  const t = useTranslations("about");
  const languages = t.raw("languages") as string[];

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-x grid-12 items-center gap-y-16">
        <div className="col-span-12 lg:col-span-7">
          <SectionHeader index={1} label={t("label")} title={t("title")} headingId="about-title" />
          <Reveal>
            <p className="prose-measure mt-8 text-ink/90">{t("body")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <StatPills
              stats={[
                { value: 4, label: t("stats.sites") },
                { value: 1, suffix: "M+", label: t("stats.runners") },
                { value: 2026, from: 2000, label: t("stats.joined") },
              ]}
            />
            <p className="mt-8 text-sm text-ink-soft">
              <span className="text-label mr-3">{t("languagesTitle")}</span>
              {languages.join(" · ")}
            </p>
          </Reveal>
        </div>

        <Reveal className="col-span-12 flex justify-center lg:col-span-5 lg:justify-end">
          <div className="relative size-[240px] md:size-[280px]">
            {/* slow rotating dashed ring + 1px hairline ring offset 12px */}
            <span
              aria-hidden
              className="absolute -inset-7 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-primary/35"
            />
            <span aria-hidden className="absolute -inset-3 rounded-full border border-line" />
            <Image
              src="/profile.jpg"
              alt={t("photoAlt")}
              fill
              sizes="280px"
              className="rounded-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

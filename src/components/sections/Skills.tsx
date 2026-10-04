import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { skillGroups } from "@/lib/projects";
import { SectionHeader } from "./SectionHeader";

/** Skills (04) — tag groups instead of progress bars. */
export function Skills() {
  const t = useTranslations("skills");

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y">
      <div className="container-x">
        <SectionHeader index={4} label={t("label")} title={t("title")} headingId="skills-title" />
        <Reveal className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2" stagger={0.08}>
          {skillGroups.map((g) => (
            <div key={g.key}>
              <h3 className="text-label mb-4">{t(`groups.${g.key}`)}</h3>
              <ul className="flex flex-wrap gap-2">
                {g.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-pastel-blue"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
        <Reveal>
          <p className="mt-14 text-ink-soft">{t("also")}</p>
        </Reveal>
      </div>
    </section>
  );
}

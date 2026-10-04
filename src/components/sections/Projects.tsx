"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { projects, type ProjectKey } from "@/lib/projects";
import { CaseStudy } from "./CaseStudy";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

/**
 * Projects (02). Text left, screenshot right — the bird hovers in the right
 * margin beside each card. (The pinned horizontal gallery comes later.)
 */
export function Projects() {
  const t = useTranslations("projects");
  const [open, setOpen] = useState<ProjectKey | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const active = projects.find((p) => p.key === open);

  return (
    <section id="projects" aria-labelledby="projects-title" className="section-y">
      <div className="container-x">
        <SectionHeader index={2} label={t("label")} title={t("title")} headingId="projects-title" />
        <Reveal>
          <p className="prose-measure mt-6 text-ink-soft">{t("intro")}</p>
        </Reveal>

        <LayoutGroup>
          <div className="mt-10">
            {projects.map((p, i) => (
              <Reveal key={p.key} className="border-t border-line first:border-t-0">
                <ProjectCard project={p} index={i} onOpen={() => setOpen(p.key)} />
              </Reveal>
            ))}
          </div>
          <AnimatePresence>
            {active && <CaseStudy key={active.key} project={active} onClose={close} />}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}

"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Project } from "@/lib/projects";
import { accents } from "@/lib/tokens";

/** Browser-window mockup. Shows a tasteful accent placeholder until screenshots exist. */
export function BrowserFrame({ project, title }: { project: Project; title: string }) {
  const host = new URL(project.liveUrl).host;
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex h-9 items-center gap-1.5 border-b border-line px-4">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-line" />
        ))}
        <span className="ml-3 truncate font-mono text-[0.6875rem] text-ink-soft">{host}</span>
      </div>
      <div className={`relative aspect-[16/10] ${accents[project.accent].bg}`}>
        {project.shots > 0 ? (
          <Image
            src={`/projects/${project.slug}-1.png`}
            alt=""
            fill
            sizes="(min-width: 1024px) 700px, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center p-8 text-center font-display text-[clamp(1.75rem,4vw,3.25rem)] leading-tight font-semibold text-ink/20"
          >
            {title.split(" — ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const t = useTranslations("projects");
  const k = project.key;
  const title = t(`${k}.title`);

  return (
    <article className="project-card grid-12 items-center gap-y-8 py-14 md:py-20">
      <div className="col-span-12 lg:col-span-5">
        <p className="text-label">
          {String(index + 1).padStart(2, "0")} · {project.year}
        </p>
        <h3 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight font-semibold tracking-[-0.02em]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-primary">{t(`${k}.tag`)}</p>
        <p className="mt-5 text-ink/85">{t(`${k}.desc`)}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <li key={tech} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-ink underline decoration-line underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary"
          >
            {t("live")} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
          </a>
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-ink underline decoration-line underline-offset-[6px] hover:text-primary"
            >
              {t("code")} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
            </a>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="text-ink-soft underline decoration-line underline-offset-[6px] transition-colors hover:text-ink"
          >
            {t("caseStudy")}
          </button>
        </div>
      </div>

      <motion.button
        type="button"
        layoutId={`frame-${k}`}
        onClick={onOpen}
        aria-label={`${t("caseStudy")}: ${title}`}
        className="col-span-12 block text-left transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] lg:col-span-7"
        style={{ borderRadius: 20 }}
      >
        <BrowserFrame project={project} title={title} />
      </motion.button>
    </article>
  );
}

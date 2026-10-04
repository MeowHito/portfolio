"use client";

import { useLenis } from "lenis/react";
import { ArrowUpRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/projects";
import { BrowserFrame } from "./ProjectCard";

/** Full-screen case study; the screenshot frame morphs in from the card (layoutId). */
export function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const t = useTranslations("projects");
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const k = project.key;
  const title = t(`${k}.title`);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      previous?.focus();
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`cs-${k}`}
      className="fixed inset-0 z-[60] overflow-y-auto bg-bg/85 backdrop-blur-md"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="container-x py-20 md:py-28" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="text-label">{t(`${k}.tag`)}</p>
              <h2 id={`cs-${k}`} className="text-section mt-3">
                {title}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm hover:bg-pastel-blue"
            >
              <X size={16} strokeWidth={1.5} aria-hidden /> {t("close")}
            </button>
          </div>

          <motion.div layoutId={`frame-${k}`} style={{ borderRadius: 20 }}>
            <BrowserFrame project={project} title={title} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.6 } }}
          >
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {(["problem", "solution", "result"] as const).map((part) => (
                <div key={part}>
                  <h3 className="text-label mb-3">{t(part)}</h3>
                  <p className="text-ink/90">{t(`${k}.${part}`)}</p>
                </div>
              ))}
            </div>

            <h3 className="text-label mt-14 mb-4">{t("features")}</h3>
            <ul className="flex flex-wrap gap-2">
              {(t.raw(`${k}.featureList`) as string[]).map((f) => (
                <li key={f} className="rounded-full border border-line px-3.5 py-1.5 text-sm">
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="text-xs text-ink-soft after:ml-2 after:content-['·'] last:after:content-['']">
                  {tech}
                </span>
              ))}
            </div>

            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-primary"
            >
              {t("visit")} {new URL(project.liveUrl).host} <ArrowUpRight size={14} aria-hidden />
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

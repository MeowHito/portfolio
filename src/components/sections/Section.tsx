import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

type SectionProps = {
  id: string;
  /** 1-based index → "01 — About" label. */
  index: number;
  label: string;
  title: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Shared section frame: numbered mono label, section title, content.
 * The header animates in on scroll (SectionHeader).
 */
export function Section({ id, index, label, title, children, className = "" }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={`section-y ${className}`}>
      <div className="container-x">
        <SectionHeader index={index} label={label} title={title} headingId={headingId} />
        {children}
      </div>
    </section>
  );
}

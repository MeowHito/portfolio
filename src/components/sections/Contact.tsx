import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { GithubIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/lib/projects";
import { CopyEmail } from "./CopyEmail";
import { SectionHeader } from "./SectionHeader";

/** Contact (05) — the email is the focal point. No form, no backend. */
export function Contact() {
  const t = useTranslations("contact");
  const link =
    "inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors duration-300 hover:border-primary/50 hover:bg-pastel-blue";

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y">
      <div className="container-x flex flex-col items-center text-center">
        <SectionHeader index={5} label={t("label")} title={t("title")} headingId="contact-title" />
        <Reveal>
          <p className="mt-6 text-ink-soft">{t("intro")}</p>
        </Reveal>
        <Reveal className="mt-12">
          <CopyEmail email={contact.email} copied={t("copied")} hint={t("copyHint")} />
        </Reveal>
        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          <a href={contact.github} target="_blank" rel="noreferrer" className={link}>
            <GithubIcon size={16} /> {contact.githubHandle}
          </a>
          <a href={`mailto:${contact.email}`} className={link}>
            <Mail size={16} strokeWidth={1.5} aria-hidden /> {t("emailLabel")}
          </a>
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/-/g, "")}`} className={link}>
              <Phone size={16} strokeWidth={1.5} aria-hidden /> {contact.phone}
            </a>
          )}
        </Reveal>
        <p className="mt-10 inline-flex items-center gap-2 text-sm text-ink-soft">
          <MapPin size={14} strokeWidth={1.5} aria-hidden /> {t("based")}
        </p>
      </div>
    </section>
  );
}

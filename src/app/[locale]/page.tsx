import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ScrollRig } from "@/components/canvas/ScrollRig";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import type { Locale } from "@/i18n/routing";

export default function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main id="main">
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
      <ScrollRig />
    </main>
  );
}

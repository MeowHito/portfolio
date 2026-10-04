import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/ui/Footer";
import { HtmlLang } from "@/components/ui/HtmlLang";
import { Nav } from "@/components/ui/Nav";
import { ScrollRestorer } from "@/components/ui/ScrollRestorer";
import { routing } from "@/i18n/routing";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", th: "/th", "x-default": "/en" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "th" ? "th_TH" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale); // enables static rendering

  return (
    <NextIntlClientProvider>
      <HtmlLang locale={locale} />
      <ScrollRestorer />
      <div lang={locale} className="font-body">
        <a href="#main" className="sr-only-focusable">
          {locale === "th" ? "ข้ามไปยังเนื้อหา" : "Skip to content"}
        </a>
        <Nav />
        {children}
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}

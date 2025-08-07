// app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Features, type Feature } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import {
  LandingFooter,
  type LandingFooterProps,
} from "@/components/layout/LandingFooter";
import {
  LandingHeader,
  type LandingHeaderProps,
} from "@/components/layout/LandingHeader";
import { CursorTrail } from "@/components/ui/CursorTrail";
import { createClient } from "@/lib/supabase/server";

/**
 * @exports HomePage
 * @description Página de Inicio Pública (Landing Page). Este Server Component
 *              orquesta la obtención de todo el contenido de la UI desde la capa de
 *              internacionalización y lo pasa como props serializables a los
 *              componentes de cliente puros.
 * @returns {Promise<JSX.Element>} El componente de la página de inicio renderizado.
 */
export default async function HomePage(): Promise<JSX.Element> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const tHeader = await getTranslations("LandingHeader");
  const tFooter = await getTranslations("LandingFooter");
  const tHero = await getTranslations("HeroSection");
  const tFeatures = await getTranslations("FeaturesSection");
  const tPrivacy = await getTranslations("PrivacyPolicyPage");
  const tTerms = await getTranslations("TermsOfServicePage");
  const tCookies = await getTranslations("CookiePolicyPage");
  const tLegal = await getTranslations("LegalNoticePage");
  const tDisclaimer = await getTranslations("DisclaimerPage");
  const tAbout = await getTranslations("AboutPage");
  const tBlog = await getTranslations("BlogPage");
  const tDocs = await getTranslations("DocsPage");

  const headerProps: LandingHeaderProps = {
    navLinks: [
      { href: "#features", label: tHeader("features") },
      { href: "/pricing", label: tHeader("pricing") },
      { href: "/docs", label: tDocs("title") },
    ],
    signInText: tHeader("signIn"),
    signUpText: tHeader("signUp"),
    openMenuText: tHeader("openMenu"),
  };

  const footerProps: LandingFooterProps = {
    slogan: tFooter("slogan"),
    productColumnTitle: tFooter("product"),
    productLinks: [
      { href: "#features", label: tHeader("features") },
      { href: "/pricing", label: tHeader("pricing") },
      { href: "/docs", label: tDocs("title") },
    ],
    companyColumnTitle: tFooter("company"),
    companyLinks: [
      { href: "/about", label: tAbout("title") },
      { href: "/blog", label: tBlog("title") },
      { href: "/contact", label: tFooter("contact") },
    ],
    newsletterTitle: tFooter("stayUpdated"),
    newsletterPrompt: tFooter("newsletterPrompt"),
    subscribeButtonText: tFooter("subscribe"),
    allRightsReservedText: tFooter("allRightsReserved", {
      year: new Date().getFullYear(),
    }),
    legalLinks: [
      { href: "/privacy", label: tPrivacy("title") },
      { href: "/terms", label: tTerms("title") },
      { href: "/cookies", label: tCookies("title") },
      { href: "/legal", label: tLegal("title") },
      { href: "/disclaimer", label: tDisclaimer("title") },
    ],
  };

  const featuresData: Feature[] = [
    {
      icon: "LayoutTemplate",
      title: tFeatures("features.builder.title"),
      description: tFeatures("features.builder.description"),
    },
    {
      icon: "PenSquare",
      title: tFeatures("features.copywriter.title"),
      description: tFeatures("features.copywriter.description"),
    },
    {
      icon: "PieChart",
      title: tFeatures("features.analytics.title"),
      description: tFeatures("features.analytics.description"),
    },
    {
      icon: "Bot",
      title: tFeatures("features.assistant.title"),
      description: tFeatures("features.assistant.description"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CursorTrail />
      <LandingHeader {...headerProps} />
      <main className="flex-1">
        <Hero
          title={tHero("title")}
          subtitle={tHero("subtitle")}
          ctaPrimaryText={tHero("ctaPrimary")}
          ctaSecondaryText={tHero("ctaSecondary")}
        />
        <Features
          title={tFeatures("title")}
          subtitle={tFeatures("subtitle")}
          features={featuresData}
        />
      </main>
      <LandingFooter {...footerProps} />
    </div>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Resolución de `FORMATTING_ERROR`**: ((Implementada)) Se ha corregido la llamada a `tFooter("allRightsReserved")` para que provea la variable `year` requerida por la cadena de traducción, eliminando el error de renderizado del servidor.
 *
 * @subsection Melhorias Futuras
 * 1. **Carga de Contenido desde un CMS**: ((Vigente)) Para máxima flexibilidad, los datos para los enlaces y características podrían cargarse desde un CMS headless (ej. Strapi, Contentful) en lugar de estar definidos en este componente, desacoplando completamente el contenido del código.
 */
// app/[locale]/page.tsx

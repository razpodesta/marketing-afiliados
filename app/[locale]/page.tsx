// app/[locale]/page.tsx
/**
 * @file Página de Inicio Pública (Landing Page)
 * @description Esta es la página de marketing principal. Ha sido refactorizada
 *              para obtener textos desde el sistema de internacionalización y
 *              pasarlos como props al componente Hero, resolviendo el bug de
 *              contenido faltante.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 9.0.0 (Internationalized Content Injection)
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { CursorTrail } from "@/components/ui/CursorTrail";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (process.env.DEV_MODE_ENABLED === "true") {
    redirect("/dashboard");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  // Obtener la función de traducción para el namespace 'HeroSection'
  const t = await getTranslations("HeroSection");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CursorTrail />
      <LandingHeader />
      <main className="flex-1">
        <Hero title={t("title")} subtitle={t("subtitle")} />
        <Features />
      </main>
      <LandingFooter />
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Inyección de Contenido i18n**: ((Implementada)) El componente ahora obtiene las traducciones en el servidor y las pasa al componente Hero, resolviendo el bug y completando el patrón de desacoplamiento.
 *
 * @subsection Melhorias Futuras
 * 1. **Metadatos Dinámicos**: ((Vigente)) Utilizar la función `generateMetadata` de Next.js junto con `getTranslations` para que el `<title>` y la `<meta name="description">` de la página también sean traducidos, mejorando el SEO internacional.
 */

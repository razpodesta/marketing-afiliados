/* Ruta: app/not-found.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { rootDomain } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * @file not-found.tsx
 * @description Página 404 raíz, consolidada y unificada para toda la aplicación.
 * REFACTORIZACIÓN ARQUITECTÓNICA: Este componente ahora sirve como la única
 * página 404 del proyecto. Contiene la lógica inteligente para detectar si el
 * usuario está en un subdominio y ofrece acciones contextuales. Esto elimina
 * la duplicación de código y garantiza una experiencia de error consistente.
 *
 * @author Metashark
 * @version 2.0.0 (Consolidated 404 Logic)
 */
export default function NotFound() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // La lógica de detección de subdominio debe ejecutarse en el cliente.
    const hostname = window.location.hostname;
    const rootDomainWithoutPort = rootDomain.split(":")[0];

    if (hostname.endsWith(`.${rootDomainWithoutPort}`)) {
      const parts = hostname.split(".");
      if (parts.length > 2) {
        setSubdomain(parts[0]);
      }
    }
  }, []);

  const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <motion.div
        initial="hidden"
        animate="show"
        variants={FADE_IN_VARIANTS}
        className="flex flex-col items-center"
      >
        <AlertTriangle className="h-16 w-16 text-primary" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tighter md:text-6xl">
          {subdomain ? "Subdominio no Encontrado" : "Error 404"}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {subdomain ? (
            <>
              El sitio en{" "}
              <span className="font-semibold text-foreground">
                {subdomain}.{rootDomain}
              </span>{" "}
              aún no ha sido creado o no está disponible.
            </>
          ) : (
            `La página que buscas en la ruta ${pathname} no existe o fue movida.`
          )}
        </p>
        <div className="mt-10 flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          {subdomain ? (
            <Button asChild>
              {/* Idealmente, este enlace debería pre-rellenar el formulario de creación */}
              <Link href="/">Crear este Sitio</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </main>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Logging de Errores 404: Implementar una `Server Action` que se llame desde un `useEffect` en esta página para registrar las URLs que generan un 404 en una tabla de Supabase. Esto es invaluable para detectar enlaces rotos internos o externos y mejorar el SEO.
 * 2. Sugerencias Inteligentes de Rutas: Para errores 404 en el dominio principal, se podría analizar el `pathname` (ej. `/caracteristicas`) y compararlo con las rutas válidas (obtenidas del `routes-manifest.json`) usando un algoritmo de similitud de cadenas (como la distancia de Levenshtein) para sugerir "¿Quizás quisiste decir /features?".
 * 3. Internacionalización del Contenido: Dado que este componente ahora es la raíz, su contenido está en español. Debería ser modificado para usar `useTranslations` de `next-intl` y mostrar los mensajes en el idioma correspondiente, convirtiéndolo en un componente verdaderamente global.
 */

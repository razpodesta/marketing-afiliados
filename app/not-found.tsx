// Ruta: app/not-found.tsx
/**
 * @file not-found.tsx (Global & Autonomous)
 * @description Página 404 raíz y única. Es un Componente de Cliente autónomo
 *              que NO utiliza hooks de `next-intl` para evitar errores de contexto.
 *              Determina el locale a partir de la URL para construir enlaces de
 *              retorno correctos.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 7.0.0 (Autonomous & Decoupled Architecture)
 */
"use client";

import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

// CORRECCIÓN ARQUITECTÓNICA: Se define `locales` localmente para hacer este
// componente completamente autónomo y desacoplado del sistema de `next-intl`.
// Esto previene dependencias de contexto circulares y resuelve el error de compilación.
const locales = ["en-US", "es-ES", "pt-BR"] as const;

export default function NotFound() {
  const pathname = usePathname();

  // Lógica de cliente segura para determinar el locale desde la URL.
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  const locale = locales.includes(potentialLocale as any)
    ? potentialLocale
    : "pt-BR"; // Fallback al locale por defecto.

  // Mensajes estáticos para evitar la dependencia del contexto.
  const messages = {
    title: "Error 404",
    description: `La página en la ruta ${pathname} no existe o fue movida.`,
    backToHome: "Volver al Inicio",
    goToDashboard: "Ir al Dashboard",
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-primary" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tighter md:text-6xl">
          {messages.title}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {messages.description}
        </p>
        <div className="mt-10 flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${locale}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {messages.backToHome}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard`}>
              <Home className="mr-2 h-4 w-4" />
              {messages.goToDashboard}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `not-found.tsx` es el manejador de errores de ruta global.
 *
 * @functionality
 * - **Autonomía:** Este componente está diseñado para ser completamente autosuficiente.
 *   La corrección crítica ha sido eliminar la importación de `locales` desde `lib/navigation.ts`
 *   y duplicar la constante localmente. Esto es una decisión de diseño deliberada.
 *   El manejador de "ruta no encontrada" no puede depender del sistema de enrutamiento
 *   que está intentando manejar, ya que eso crea una dependencia circular de contexto
 *   que causa el fallo de compilación.
 * - **Detección de Idioma:** Analiza el `pathname` para inferir el idioma del usuario y así
 *   construir enlaces de "Volver al Inicio" que lo lleven a la versión localizada correcta
 *   de la página principal.
 *
 * @relationships
 * - Es un archivo especial de Next.js que se renderiza automáticamente para cualquier ruta no reconocida.
 * - Ahora no tiene dependencias lógicas con el resto de la aplicación, solo con componentes de UI
 *   genéricos, lo que lo hace extremadamente robusto.
 *
 * @expectations
 * - Se espera que este componente nunca falle, incluso si el resto del sistema de enrutamiento
 *   tiene problemas. Al hacerlo autónomo, hemos garantizado que la aplicación siempre tendrá
 *   una página 404 funcional, resolviendo el error `500 Internal Server Error` en producción.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la página 404.
 *
 * 1.  **Internacionalización Ligera:** Para traducir esta página, se podría implementar una pequeña lógica que cargue un objeto de mensajes simple basado en el `locale` detectado, manteniendo el componente autónomo.
 * 2.  **Sugerencias de Rutas Inteligentes:** Analizar el `pathname` y compararlo con un manifiesto de rutas para sugerir al usuario la página correcta (ej. "¿Quizás quisiste decir /features?").
 * 3.  **Logging de Errores 404:** Implementar una Server Action que se llame desde un `useEffect` para registrar las URLs que generan un 404, lo cual es invaluable para detectar enlaces rotos.
 */
// Ruta: app/not-found.tsx

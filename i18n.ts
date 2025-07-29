// Ruta: i18n.ts
/**
 * @file i18n.ts
 * @description Configura la carga de los archivos de mensajes (traducciones).
 *              Este aparato es el punto de entrada para que `next-intl`
 *              comprenda los idiomas y rutas de la aplicación.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Canonical Path Fix)
 */
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// CORRECCIÓN CRÍTICA (Build Error): Se reemplaza la ruta relativa incorrecta
// por el alias canónico que apunta a la única fuente de verdad para la
// configuración de enrutamiento.
import { locales } from "@/lib/navigation";

export default getRequestConfig(async ({ locale }) => {
  // Valida que el `locale` entrante (ej. 'es-ES') es uno de los soportados.
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `i18n.ts` es la configuración central para el
 *               sistema de internacionalización de `next-intl`.
 *
 * @functionality
 * - **Carga de Mensajes:** Su función principal es decirle a `next-intl` cómo cargar
 *   dinámicamente el archivo JSON de traducciones correcto (`messages/{locale}.json`)
 *   basándose en el `locale` de la petición actual.
 * - **Validación de Idioma:** Actúa como un guardián, verificando que el `locale`
 *   solicitado esté en nuestra lista de `locales` soportados. Si no lo está,
 *   llama a `notFound()`, lo que activará el renderizado de nuestra página 404.
 *
 * @relationships
 * - Depende de forma crítica de `lib/navigation.ts` para obtener la lista de `locales`
 *   válidos. La corrección de la ruta de importación a `@/lib/navigation` es
 *   esencial para que esta dependencia funcione, resolviendo así el error de build.
 *
 * @expectations
 * - Se espera que este archivo sea la única configuración de `getRequestConfig`. Su
 *   correcto funcionamiento es la base para que toda la internacionalización
 *   de la aplicación funcione como se espera.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la estrategia de internacionalización.
 *
 * 1.  **Integración con un CMS de Traducciones:** Para facilitar la gestión de traducciones por parte de equipos no técnicos, se podría integrar un servicio como `Lokalise` o `Phrase`.
 * 2.  **Carga de Namespaces:** Para aplicaciones extremadamente grandes, `next-intl` soporta la división de los archivos de mensajes en "namespaces". Esta función podría ser modificada para cargar solo los namespaces necesarios.
 * 3.  **Gestión de Pluralización y Formatos Complejos:** Aprovechar las características avanzadas de `next-intl` para manejar reglas de pluralización, formatos de moneda y fechas/horas específicas de cada `locale`.
 */
// Ruta: i18n.ts

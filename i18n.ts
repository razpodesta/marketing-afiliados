// Ruta: i18n.ts
/**
 * @file i18n.ts
 * @description Configura la carga de los archivos de mensajes (traducciones).
 *              Este aparato es el punto de entrada para que `next-intl`
 *              comprenda los idiomas y rutas de la aplicación. Refactorizado
 *              para una gestión de errores robusta y explícita.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.2.0 (Robust Locale Handling)
 */
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { locales } from "@/lib/navigation";
import { logger } from "@/lib/logging";

export default getRequestConfig(async ({ locale }) => {
  // 1. Validar que el `locale` extraído de la URL es uno de los soportados.
  //    Esta es una guarda de seguridad. Si el middleware falla, esto previene
  //    que se intente cargar un archivo de mensajes que no existe.
  if (!locales.includes(locale as any)) {
    logger.warn(`Intento de acceso con un locale inválido: "${locale}".`);
    notFound();
  }

  // 2. Cargar dinámicamente el archivo de mensajes correspondiente.
  //    El bloque try/catch asegura que si un archivo JSON está corrupto o falta,
  //    la aplicación no crashea, sino que muestra las claves de traducción.
  try {
    return {
      messages: (await import(`./messages/${locale}.json`)).default,
    };
  } catch (error) {
    logger.error(
      `Error crítico al cargar el archivo de mensajes para el locale "${locale}":`,
      error
    );
    // En caso de fallo, proveemos un objeto vacío para evitar un crash total.
    return {
      messages: {},
    };
  }
});
// Ruta: i18n.ts

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

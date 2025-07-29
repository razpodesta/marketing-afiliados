// i18n.ts
/**
 * @file i18n.ts
 * @description Configura la carga de los archivos de mensajes (traducciones).
 * REFACTORIZACIÓN CRÍTICA DE ESTABILIDAD:
 * 1. Se ha eliminado la llamada a `notFound()` que es incompatible con el
 *    flujo de renderizado de errores de `next-intl`.
 * 2. Ahora, si se accede a un `locale` inválido, el sistema no lanzará un 404
 *    sino que cargará los mensajes del `locale` por defecto. La validación
 *    y redirección se delegan al middleware.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Stable Locale Handling)
 */
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { locales } from "./navigation";

export default getRequestConfig(async ({ locale }) => {
  // Valida que el `locale` entrante (ej. 'es-ES') es uno de los soportados.
  // Esta es la forma correcta de manejar un locale inválido según la documentación.
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
/* MEJORAS FUTURAS DETECTADAS
 * 1. Integración con un CMS de Traducciones: Para proyectos grandes o equipos donde los traductores no son desarrolladores, la gestión de archivos JSON puede ser engorrosa. Una mejora arquitectónica sería integrar un Sistema de Gestión de Contenidos (CMS) para traducciones como `Lokalise`, `Phrase` o `Contentful`. En ese caso, esta función, en lugar de importar un archivo local, haría una llamada a la API del CMS para obtener las traducciones.
 * 2. Carga de Namespaces (Nombres de Espacio): Para aplicaciones extremadamente grandes con miles de cadenas de texto por idioma, `next-intl` soporta la división de los archivos de mensajes en "namespaces" (ej. `common.json`, `dashboard.json`). Esta función podría ser modificada para cargar solo los namespaces necesarios para la ruta actual, optimizando aún más el uso de memoria.
 * 3. Gestión de Pluralización y Formatos Complejos: A medida que la aplicación crezca, se pueden aprovechar las características avanzadas de `next-intl` para manejar reglas de pluralización complejas, formatos de moneda y fechas/horas específicas de cada `locale`, todo configurado dentro de este archivo.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Carga de Mensajes bajo Demanda:** Explorar la carga de mensajes solo para los componentes necesarios en páginas muy grandes.
2.  **Integración con un CMS de Traducciones:** Integrar servicios como `Lokalise` o `Phrase` para gestionar traducciones externamente.
1.  **Carga de Mensajes bajo Demanda:** Para aplicaciones con muchos idiomas o mensajes, se podría
 *    explorar estrategias para cargar solo los mensajes necesarios para una página específica,
 *    en lugar del archivo completo, aunque la configuración actual es muy eficiente para la
 *    mayoría de los casos de uso.
2.  **Integración con un CMS de Traducciones:** Para facilitar la gestión de traducciones por
 *    parte de equipos no técnicos, se podría integrar un servicio como `Lokalise` o `Phrase`,
 *    donde los mensajes se obtendrían a través de una API en lugar de archivos JSON locales.
*/

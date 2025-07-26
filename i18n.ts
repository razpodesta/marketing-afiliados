// Ruta: i18n.ts

import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "./navigation";

/**
 * @file i18n.ts
 * @description Configura la carga de los archivos de mensajes (traducciones)
 * para el `locale` de la petición actual (ej. `es-ES`, `en-US`, `pt-BR`).
 * Este código ya es correcto y funciona con los nombres de archivo estandarizados.
 *
 * @author Metashark
 * @version 2.0.0 (Standardized Locales)
 */
export default getRequestConfig(async ({ locale }) => {
  // Valida que el `locale` entrante (ej. 'es-ES') es uno de los soportados.
  if (!locales.includes(locale as any)) notFound();

  // Carga dinámicamente el archivo JSON correspondiente al locale validado.
  // Ejemplo: import('./messages/es-ES.json')
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

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

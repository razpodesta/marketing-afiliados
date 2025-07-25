// i18n.ts
/**
 * @file Next-Intl Configuration
 * @description Configura la carga de los archivos de mensajes (traducciones)
 * para el locale de la petición actual.
 *
 * @author Metashark
 * @version 1.1.0 (Version Compatibility Fix)
 */

import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "./navigation";

export default getRequestConfig(async ({ locale }) => {
  // <-- CORRECCIÓN
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

// lib/navigation.ts
/**
 * @file lib/navigation.ts
 * @description Manifiesto de Enrutamiento y Contrato de Navegación.
 *              Este archivo es generado AUTOMÁTICAMENTE por el script
 *              `scripts/generate-routes-manifest.mjs`. NO LO EDITE MANUALMENTE.
 * @author L.I.A Legacy (Generado Automáticamente)
 * @version 2025-08-06T19:10:59.998Z
 */
import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export type AppLocale = (typeof locales)[number];
export const localePrefix = "as-needed";

export const pathnames = {
  "/": "/",
  "/about": "/about",
  "/admin": "/admin",
  "/auth/login": "/auth/login",
  "/auth/signup": "/auth/signup",
  "/blog": "/blog",
  "/builder/[campaignId]": "/builder/[campaignId]",
  "/choose-language": "/choose-language",
  "/contact": "/contact",
  "/cookies": "/cookies",
  "/dashboard": "/dashboard",
  "/dashboard/settings": "/dashboard/settings",
  "/dashboard/sites": "/dashboard/sites",
  "/dashboard/sites/[siteId]/campaigns": "/dashboard/sites/[siteId]/campaigns",
  "/dev-console": "/dev-console",
  "/dev-console/campaigns": "/dev-console/campaigns",
  "/dev-console/logs": "/dev-console/logs",
  "/dev-console/sentry-test": "/dev-console/sentry-test",
  "/dev-console/telemetry": "/dev-console/telemetry",
  "/dev-console/users": "/dev-console/users",
  "/disclaimer": "/disclaimer",
  "/forgot-password": "/forgot-password",
  "/gallery/bridgepages": "/gallery/bridgepages",
  "/gallery/landings": "/gallery/landings",
  "/legal": "/legal",
  "/lia-chat": "/lia-chat",
  "/privacy": "/privacy",
  "/reset-password": "/reset-password",
  "/support": "/support",
  "/terms": "/terms",
  "/welcome": "/welcome",
  "/wiki": "/wiki"
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

export type AppPathname = keyof typeof pathnames;

// middleware/handlers/redirects/index.ts
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";

/**
 * @file middleware/handlers/redirects/index.ts
 * @description Manejador de middleware para redirecciones canónicas y de SEO.
 *              Gestiona la redirección de `www.` al dominio raíz.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export function handleRedirects(request: NextRequest): NextResponse | null {
  const { host, pathname } = request.nextUrl;

  if (host.startsWith("www.")) {
    const newHost = host.replace("www.", "");
    const newUrl = new URL(pathname, `https://${newHost}`);
    logger.trace(
      { from: host, to: newHost },
      "[REDIRECTS_HANDLER] Redirección WWW canónica."
    );
    return NextResponse.redirect(newUrl, 301);
  }

  return null;
}

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Redirecciones desde Base de Datos: Crear una tabla `redirects` en Supabase que mapee rutas antiguas a nuevas. Este manejador podría consultar esa tabla (con una caché agresiva) para gestionar redirecciones de marketing o de reestructuración del sitio de forma dinámica.
 * 2. Normalización de Slashes: Añadir lógica para asegurar que las URLs siempre tengan (o no tengan) un slash al final, según la política de SEO definida, para evitar contenido duplicado.
 */

// Ruta: middleware/handlers/redirects.handler.ts
/**
 * @file redirects.handler.ts
 * @description Manejador de middleware para redirecciones canónicas y de SEO.
 * Actualmente, gestiona la redirección de `www.` al dominio raíz.
 *
 * @author Metashark
 * @version 1.0.0
 */
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description Gestiona la redirección de `www` al dominio raíz.
 * @param {NextRequest} request - La petición entrante.
 * @returns {NextResponse | null} Una respuesta de redirección 301, o null para continuar.
 */
export function handleRedirects(request: NextRequest): NextResponse | null {
  const { host, pathname } = request.nextUrl;

  if (host.startsWith("www.")) {
    const newHost = host.replace("www.", "");
    const newUrl = new URL(pathname, `https://${newHost}`);
    return NextResponse.redirect(newUrl, 301); // 301 para redirección permanente (SEO)
  }

  return null;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Redirecciones desde Base de Datos: Crear una tabla `redirects` en Supabase que mapee rutas antiguas a nuevas. Este manejador podría consultar esa tabla para gestionar redirecciones de marketing o de reestructuración del sitio de forma dinámica.
 * 2. Normalización de Slashes: Añadir lógica para asegurar que las URLs siempre tengan (o no tengan) un slash al final, según la política de SEO definida, para evitar contenido duplicado.
 * 3. Manejo de Mayúsculas/Minúsculas: Forzar todas las rutas a minúsculas para mejorar la consistencia y el SEO.
 */

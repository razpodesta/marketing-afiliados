/**
 * @file auth.handler.ts
 * @description Manejador de middleware para la autenticación y la gestión de contexto de sesión.
 * @refactor
 * REFACTORIZACIÓN CRÍTICA DE SESIÓN:
 * 1. Se ha añadido lógica para comprobar la existencia de la cookie `active_workspace_id`.
 * 2. Si la cookie no existe para un usuario autenticado, este manejador la establece
 *    con el primer workspace disponible, garantizando la consistencia del estado
 *    antes de que se renderice el layout. Esto resuelve el error de ejecución de cookies.
 *
 * @author Metashark
 * @version 2.0.0 (Workspace Cookie Middleware)
 */
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = ["/dashboard", "/admin", "/dev-console"];
const AUTH_ROUTE = "/login";

export async function handleAuth(
  request: NextRequest,
  locale: string
): Promise<NextResponse | null> {
  const { supabase, response } = await createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin } = request.nextUrl;
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = pathnameWithoutLocale.startsWith(AUTH_ROUTE);

  // 1. Redirección si no hay sesión en rutas protegidas
  if (!session && isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/login`, origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirección si hay sesión en la ruta de autenticación
  if (session && isAuthRoute) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. MEJORA: Gestión de la cookie del workspace activo
  if (session && isProtectedRoute) {
    const workspaceCookie = request.cookies.get("active_workspace_id");
    if (!workspaceCookie) {
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("id")
        .limit(1);

      if (workspaces && workspaces.length > 0) {
        response.cookies.set("active_workspace_id", workspaces[0].id, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        });
      }
    }
  }

  return null; // Devuelve null para permitir que la cadena de middleware continúe.
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Protección Basada en Roles: La comprobación actual solo verifica si existe una sesión. La lógica puede extenderse para leer el rol del usuario de la sesión (previamente añadido vía JWT) y proteger rutas como `/admin` o `/dev-console` con mayor granularidad.
 * 2. Manejo de Token Expirado: Añadir lógica para manejar el caso en que una sesión existe pero el token ha expirado, forzando un `sign-out` o una redirección a la página de login con un mensaje específico.
 * 3. Abstracción de Rutas: Mover las constantes `PROTECTED_ROUTES` y `AUTH_ROUTE` a un archivo de configuración central (ej. `navigation.ts`) para que puedan ser compartidas con otras partes de la aplicación.
 */

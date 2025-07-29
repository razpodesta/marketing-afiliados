// middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para la autenticación y protección de rutas.
 * @author L.I.A Legacy
 * @version 6.2.0 (Scope & Typing Fix)
 */
import { getFirstWorkspaceForUser } from "../../../lib/data/workspaces";
import { logger } from "../../../lib/logging";
import { createClient } from "../../../lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/dev-console",
  "/welcome",
  "/lia-chat",
];
const ADMIN_ROUTES = ["/admin", "/dev-console"];
const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROOT = "/";

export async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const locale = response.headers.get("x-app-locale") || "pt-BR";

  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.trace("[AUTH_HANDLER] Bypass por Modo de Desarrollo activado.");
    return response;
  }

  const { supabase, response: supabaseResponse } = await createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin } = request.nextUrl;
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  logger.trace(
    { session: !!session, path: pathnameWithoutLocale },
    "[AUTH_HANDLER] Verificando estado."
  );

  const isProtectedRoute = PROTECTED_ROUTES.some((route: string) =>
    pathnameWithoutLocale.startsWith(route)
  ); // CORRECCIÓN DE TIPO
  const isAuthRoute = AUTH_ROUTES.some((route: string) =>
    pathnameWithoutLocale.startsWith(route)
  ); // CORRECCIÓN DE TIPO
  const isPublicRoot = pathnameWithoutLocale === PUBLIC_ROOT;

  if (!session) {
    if (isProtectedRoute) {
      logger.warn(
        `[AUTH_HANDLER] Acceso no autenticado bloqueado: ${pathname}. Redirigiendo a login.`
      );
      const loginUrl = new URL(`/${locale}/login`, origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    logger.trace(
      "[AUTH_HANDLER] Usuario no autenticado en ruta pública. Permitido."
    );
    return supabaseResponse;
  }

  if (session) {
    if (isAuthRoute) {
      logger.info(
        `[AUTH_HANDLER] Usuario autenticado en ruta de auth. Redirigiendo a dashboard.`
      );
      const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
      return NextResponse.redirect(dashboardUrl);
    }

    if (isPublicRoot) {
      logger.info(
        `[AUTH_HANDLER] Usuario autenticado en la raíz. Redirigiendo a dashboard.`
      );
      const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
      return NextResponse.redirect(dashboardUrl);
    }

    const workspaceCookie = request.cookies.get("active_workspace_id");
    if (!workspaceCookie) {
      const firstWorkspace = await getFirstWorkspaceForUser(session.user.id);
      if (firstWorkspace) {
        logger.info(
          `[AUTH_HANDLER] Estableciendo workspace activo para ${session.user.id}`
        );
        supabaseResponse.cookies.set("active_workspace_id", firstWorkspace.id, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        });
        return NextResponse.redirect(request.url, {
          headers: supabaseResponse.headers,
        });
      } else {
        const welcomeUrl = new URL(`/${locale}/welcome`, origin);
        if (pathnameWithoutLocale !== "/welcome") {
          return NextResponse.redirect(welcomeUrl);
        }
      }
    }

    const isAdminRoute = ADMIN_ROUTES.some((route: string) =>
      pathnameWithoutLocale.startsWith(route)
    ); // CORRECCIÓN DE TIPO
    if (isAdminRoute) {
      const userRole = session.user.app_metadata?.app_role;
      const allowedRoles = ["admin", "developer"];
      if (!userRole || !allowedRoles.includes(userRole)) {
        logger.warn(
          `[AUTH_HANDLER] Acceso de rol no autorizado a ${pathname}. Redirigiendo.`
        );
        const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return supabaseResponse;
}

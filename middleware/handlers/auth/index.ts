// Ruta: middleware/handlers/auth/index.ts (APARATO FINAL CORREGIDO Y BLINDADO)
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para autenticación y protección de rutas.
 *              Orquesta el acceso a rutas basándose en el estado de autenticación
 *              y roles del usuario, con un flujo lógico de "seguridad primero".
 * @author L.I.A Legacy & RaZ Podestá
 * @version 8.4.0 (Resilience Hardening)
 */
import { type NextRequest, NextResponse } from "next/server";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { getFirstWorkspaceForUser } from "@/lib/data/workspaces";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/dev-console",
  "/welcome",
  "/lia-chat",
];
const ADMIN_DEV_ROUTES = ["/admin", "/dev-console"];
const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROOT = "/";

/**
 * @async
 * @function handleAuth
 * @description Gestiona el flujo de autenticación para las peticiones entrantes.
 * @param {NextRequest} request - El objeto de la petición Next.js.
 * @param {NextResponse} response - El objeto de la respuesta Next.js.
 * @returns {Promise<NextResponse>} La respuesta modificada.
 */
export async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const locale = response.headers.get("x-app-locale") || "pt-BR";
  const { pathname, origin } = request.nextUrl;
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  if (process.env.DEV_MODE_ENABLED === "true") {
    return response;
  }

  const { response: supabaseResponse } = await createClient(request);

  let authData: UserAuthData | null = null;
  try {
    authData = await getAuthenticatedUserAuthData();
  } catch (error) {
    logger.error(
      "[AUTH_HANDLER] Fallo crítico al obtener datos de autenticación:",
      error
    );
    authData = null;
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (!authData) {
    if (isProtectedRoute) {
      const loginUrl = new URL(`/${locale}/login`, origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  if (isAuthRoute || pathnameWithoutLocale === PUBLIC_ROOT) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }

  if (pathnameWithoutLocale === "/welcome") {
    const userHasWorkspace =
      authData.activeWorkspaceId ||
      (await getFirstWorkspaceForUser(authData.user.id));
    if (userHasWorkspace) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
    }
    return supabaseResponse;
  }

  const isAdminDevRoute = ADMIN_DEV_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  if (isAdminDevRoute) {
    const isDeveloper = authData.appRole === "developer";
    if (pathnameWithoutLocale.startsWith("/dev-console") && !isDeveloper) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
    }
    if (
      pathnameWithoutLocale.startsWith("/admin") &&
      !["admin", "developer"].includes(authData.appRole)
    ) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
    }
    return supabaseResponse;
  }

  if (authData.activeWorkspaceId) {
    return supabaseResponse;
  }

  // Flujo de Onboarding final, ahora blindado con try/catch.
  try {
    const firstWorkspace = await getFirstWorkspaceForUser(authData.user.id);
    if (firstWorkspace) {
      supabaseResponse.cookies.set("active_workspace_id", firstWorkspace.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
      return NextResponse.redirect(request.url, {
        headers: supabaseResponse.headers,
      });
    } else {
      return NextResponse.redirect(new URL(`/${locale}/welcome`, origin));
    }
  } catch (error) {
    logger.error(
      "[AUTH_HANDLER] Fallo en la capa de datos durante el onboarding:",
      error
    );
    // En caso de fallo, se permite el paso para que la página de destino pueda mostrar un error.
    return supabaseResponse;
  }
}

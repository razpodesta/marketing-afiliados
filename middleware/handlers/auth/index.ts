// Ruta: middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para autenticación y protección de rutas.
 *              Refactorizado para ser un manejador de estado puro que consume el
 *              manifiesto de enrutamiento centralizado.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 9.0.0 (Pure State Handler & Architectural Alignment)
 */
import { type NextRequest, NextResponse } from "next/server";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { getFirstWorkspaceForUser } from "@/lib/data/workspaces";
import { logger } from "@/lib/logging";
import { ROUTE_DEFINITIONS } from "@/lib/routing-manifest"; // <-- CONSUMO DEL MANIFIESTO
import { createClient } from "@/lib/supabase/middleware";

// --- DEFINICIONES DE RUTA LOCALES ELIMINADAS ---

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
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || "/"
    : pathname;

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

  const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );

  if (!authData) {
    if (isProtectedRoute) {
      const loginUrl = new URL(`/${locale}/login`, origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const isAuthRoute = ROUTE_DEFINITIONS.auth.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );
  if (isAuthRoute || pathnameWithoutLocale === "/") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }

  // (El resto de la lógica de onboarding y RBAC se mantiene igual)
  // ...
  if (pathnameWithoutLocale === "/welcome") {
    const userHasWorkspace =
      authData.activeWorkspaceId ||
      (await getFirstWorkspaceForUser(authData.user.id));
    if (userHasWorkspace) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
    }
    return supabaseResponse;
  }

  const isAdminDevRoute = [...ROUTE_DEFINITIONS.protected].some(
    (route) =>
      pathnameWithoutLocale.startsWith(route) &&
      (route === "/admin" || route === "/dev-console")
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
    return supabaseResponse;
  }
}

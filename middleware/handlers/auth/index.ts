// middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para autenticación y protección de rutas.
 *              Valida las URLs de redirección para prevenir vulnerabilidades de Open Redirect.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 9.1.0 (Security Hardening: Open Redirect Prevention)
 * @see {@link file://../../tests/auth.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar la seguridad y el flujo del manejador de autenticación.
 *
 * 1.  **Lista Blanca de Redirección (Allow-list):** (Vigente) Para una seguridad aún más estricta, en lugar de solo verificar si la ruta es relativa, se podría mantener una lista blanca explícita de dominios a los que se permite redirigir.
 * 2.  **Tokens de Redirección de un Solo Uso:** (Vigente) Implementar un sistema donde el servidor genere un token de un solo uso que represente la URL de redirección segura.
 * 3.  **Refactorización de Lógica de Redirección:** (Vigente) La lógica de redirección segura se repite. Podría abstraerse a una función de utilidad `createSafeRedirectUrl` para adherirse al principio DRY.
 */
import { type NextRequest, NextResponse } from "next/server";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { getFirstWorkspaceForUser } from "@/lib/data/workspaces";
import { logger } from "@/lib/logging";
import { ROUTE_DEFINITIONS } from "@/lib/routing-manifest";
import { createClient } from "@/lib/supabase/middleware";

export async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const locale = response.headers.get("x-app-locale") || "pt-BR";
  const { pathname, origin, searchParams } = request.nextUrl;
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

      const nextPath = pathname;
      if (nextPath.startsWith("/")) {
        loginUrl.searchParams.set("next", nextPath);
      } else {
        logger.warn(
          { attemptedRedirect: nextPath },
          "[SECURITY] Intento de Open Redirect bloqueado."
        );
      }

      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const isAuthRoute = ROUTE_DEFINITIONS.auth.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );
  if (isAuthRoute || pathnameWithoutLocale === "/") {
    const nextUrlParam = searchParams.get("next");
    if (nextUrlParam && nextUrlParam.startsWith("/")) {
      return NextResponse.redirect(new URL(nextUrlParam, origin));
    }

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
// middleware/handlers/auth/index.ts

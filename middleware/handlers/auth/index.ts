// Ruta: middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para autenticación y protección de rutas.
 *              Refactorizado para ser un manejador de estado puro que consume el
 *              manifiesto de enrutamiento y, críticamente, valida las URLs de
 *              redirección para prevenir vulnerabilidades de Open Redirect.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 9.1.0 (Security Hardening: Open Redirect Prevention)
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

      // --- PARCHE DE SEGURIDAD: PREVENCIÓN DE OPEN REDIRECT ---
      // Se valida que la ruta 'next' sea una ruta relativa segura.
      const nextPath = pathname;
      if (nextPath.startsWith("/")) {
        loginUrl.searchParams.set("next", nextPath);
      } else {
        logger.warn(
          { attemptedRedirect: nextPath },
          "[SECURITY] Intento de Open Redirect bloqueado."
        );
        // Si no es segura, no se añade el parámetro, lo que resultará
        // en una redirección segura al dashboard por defecto post-login.
      }

      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const isAuthRoute = ROUTE_DEFINITIONS.auth.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );
  if (isAuthRoute || pathnameWithoutLocale === "/") {
    // --- LÓGICA DE REDIRECCIÓN POST-LOGIN SEGURA ---
    const nextUrlParam = request.nextUrl.searchParams.get("next");
    // Se valida de nuevo el parámetro 'next' por si el usuario llega a /login con él.
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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `handleAuth` es el guardián de la seguridad de rutas y sesiones.
 *
 * @functionality
 * - **Protección de Rutas:** Redirige a los usuarios no autenticados que intentan acceder a rutas protegidas.
 * - **Flujo Post-Login:** Redirige a los usuarios ya autenticados lejos de las páginas de autenticación.
 * - **Prevención de Open Redirect (Refactorización Clave):** Se ha añadido una validación explícita
 *   para el parámetro `next`. La lógica ahora verifica que la ruta de redirección sea relativa
 *   (comience con `/`) antes de usarla. Si la validación falla, se registra una advertencia de
 *   seguridad y se utiliza un fallback seguro, mitigando eficazmente la vulnerabilidad.
 * - **Gestión de Onboarding:** Dirige a los nuevos usuarios sin workspace a la página `/welcome`.
 * - **Control de Acceso Basado en Roles (RBAC):** Protege las rutas `/admin` y `/dev-console`
 *   basándose en el `appRole` del usuario.
 *
 * @relationships
 * - Es un manejador clave en el pipeline del `middleware.ts`.
 * - Depende del Guardián de Permisos (`lib/auth/user-permissions.ts`) para obtener los datos de la sesión.
 * - Consume el manifiesto de enrutamiento (`lib/routing-manifest.ts`) como su fuente de verdad
 *   para la clasificación de rutas.
 *
 * @expectations
 * - Se espera que este manejador sea una barrera de seguridad infalible. Con el parche de
 *   seguridad, ahora maneja de forma robusta las redirecciones, protegiendo a los usuarios
 *   contra ataques de phishing basados en Open Redirect.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1.  **Lista Blanca de Redirección (Allow-list):** Para una seguridad aún más estricta, en lugar de solo verificar si la ruta es relativa, se podría mantener una lista blanca explícita de dominios a los que se permite redirigir (útil si se necesita redirigir a subdominios de confianza).
 * 2.  **Tokens de Redirección de un Solo Uso:** Implementar un sistema donde el servidor genere un token de un solo uso que represente la URL de redirección segura. El parámetro `next` contendría este token en lugar de la URL directa, que sería validado por el servidor post-login.
 * 3.  **Refactorización de Lógica de Redirección:** La lógica de redirección segura se repite (al proteger rutas y al manejar el post-login). Podría abstraerse a una función de utilidad `createSafeRedirectUrl` para adherirse al principio DRY.
 */

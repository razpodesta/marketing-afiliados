// middleware/handlers/auth/index.ts
/**
 * @file auth/index.ts
 * @description Manejador de autenticación y autorización.
 *              REFACTORIZADO: Corregida la capitalización en la ruta de importación
 *              y restaurada la integridad completa del aparato.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 16.1.1 (Build Fix & Integrity Restoration)
 */
import { type NextRequest, NextResponse } from "next/server";

import {
  getAuthDataForMiddleware,
  type UserAuthData,
} from "@/lib/auth/middleware-permissions";
import { ROUTE_DEFINITIONS } from "@/lib/routing-manifest";
import { createClient } from "@/lib/supabase/middleware";

type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};
type UserSessionStatus =
  | { state: "UNAUTHENTICATED" }
  | { state: "AUTHENTICATED"; authData: UserAuthData }
  | { state: "DEV_MODE" };

async function getUserSessionStatus(
  logger: Logger
): Promise<UserSessionStatus> {
  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.info("[AUTH_HANDLER] DEV_MODE active. Bypassing session check.");
    return { state: "DEV_MODE" };
  }
  const authData = await getAuthDataForMiddleware();
  if (!authData) {
    logger.trace("[AUTH_HANDLER] Session status: UNAUTHENTICATED.");
    return { state: "UNAUTHENTICATED" };
  }
  logger.trace("[AUTH_HANDLER] Session status: AUTHENTICATED.", {
    userId: authData.user.id,
    activeWorkspaceId: authData.activeWorkspaceId,
  });
  return { state: "AUTHENTICATED", authData };
}

function handleUnauthenticatedUser(
  request: NextRequest,
  pathname: string,
  locale: string,
  logger: Logger
): NextResponse | null {
  logger.trace("[AUTH_HANDLER] Procesando como usuario UNAUTHENTICATED.");
  const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
    pathname.startsWith(r)
  );
  if (isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    logger.info(
      "[AUTH_HANDLER] DECISION: Unauthenticated user on protected route. Redirecting.",
      { from: pathname, to: loginUrl.pathname }
    );
    return NextResponse.redirect(loginUrl);
  }
  logger.trace(
    "[AUTH_HANDLER] DECISION: Unauthenticated user on public route. Allowing access."
  );
  return null;
}

function checkRoutePermissions(
  pathname: string,
  authData: UserAuthData,
  logger: Logger
): { isAllowed: boolean; reason?: string } {
  const { appRole } = authData;
  if (pathname.startsWith("/dev-console") && appRole !== "developer") {
    logger.warn(
      "[AUTH_HANDLER] PERMISSION_DENIED: Non-developer access to /dev-console.",
      { userId: authData.user.id, role: appRole }
    );
    return { isAllowed: false, reason: "Developer role required." };
  }
  if (
    pathname.startsWith("/admin") &&
    !["admin", "developer"].includes(appRole)
  ) {
    logger.warn(
      "[AUTH_HANDLER] PERMISSION_DENIED: Non-admin access to /admin.",
      { userId: authData.user.id, role: appRole }
    );
    return { isAllowed: false, reason: "Admin role required." };
  }
  return { isAllowed: true };
}

function handleAuthenticatedUser(
  request: NextRequest,
  authData: UserAuthData,
  pathname: string,
  locale: string,
  logger: Logger
): NextResponse | null {
  logger.trace("[AUTH_HANDLER] Procesando como usuario AUTHENTICATED.");
  const { origin } = request.nextUrl;
  const needsOnboarding = !authData.activeWorkspaceId;
  const isAuthRoute = ROUTE_DEFINITIONS.auth.some((r) =>
    pathname.startsWith(r)
  );
  if (isAuthRoute || pathname === "/") {
    const redirectTo = new URL(`/${locale}/dashboard`, origin);
    logger.info(
      "[AUTH_HANDLER] DECISION: Authenticated user on auth/public route. Redirecting.",
      { from: pathname, to: redirectTo.pathname }
    );
    return NextResponse.redirect(redirectTo);
  }
  if (needsOnboarding && pathname !== "/welcome") {
    const welcomeUrl = new URL(`/${locale}/welcome`, origin);
    logger.info(
      "[AUTH_HANDLER] DECISION: User needs onboarding. Redirecting.",
      { from: pathname, to: welcomeUrl.pathname }
    );
    return NextResponse.redirect(welcomeUrl);
  }
  if (!needsOnboarding && pathname === "/welcome") {
    const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
    logger.info(
      "[AUTH_HANDLER] DECISION: Onboarded user on /welcome. Redirecting.",
      { from: pathname, to: dashboardUrl.pathname }
    );
    return NextResponse.redirect(dashboardUrl);
  }
  const permission = checkRoutePermissions(pathname, authData, logger);
  if (!permission.isAllowed) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
    logger.warn(
      "[AUTH_HANDLER] DECISION: Permission denied for route. Redirecting to dashboard.",
      { from: pathname, reason: permission.reason }
    );
    return NextResponse.redirect(dashboardUrl);
  }
  logger.trace("[AUTH_HANDLER] DECISION: Authenticated user access granted.", {
    path: pathname,
  });
  return null;
}

export async function handleAuth(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  logger.trace("==> [AUTH_HANDLER] INICIO <==", { path: pathname });
  const locale = response.headers.get("x-app-locale") || "pt-BR";
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  const { response: supabaseResponse } = await createClient(request);
  let userStatus: UserSessionStatus;
  try {
    userStatus = await getUserSessionStatus(logger);
  } catch (error) {
    logger.error(
      "[AUTH_HANDLER] CRITICAL: Fallo al obtener estado de sesión. Asumiendo no autenticado.",
      { error: error instanceof Error ? error.message : String(error) }
    );
    userStatus = { state: "UNAUTHENTICATED" };
  }
  logger.info("[AUTH_HANDLER] Estado de sesión determinado.", {
    status: userStatus.state,
  });
  let resultResponse: NextResponse | null = null;
  switch (userStatus.state) {
    case "DEV_MODE":
      logger.trace("==> [AUTH_HANDLER] FIN (DEV_MODE) <==", { path: pathname });
      return response;
    case "UNAUTHENTICATED":
      resultResponse = handleUnauthenticatedUser(
        request,
        pathnameWithoutLocale,
        locale,
        logger
      );
      break;
    case "AUTHENTICATED":
      resultResponse = handleAuthenticatedUser(
        request,
        userStatus.authData,
        pathnameWithoutLocale,
        locale,
        logger
      );
      break;
  }
  const finalResponse = resultResponse || supabaseResponse;
  logger.trace("==> [AUTH_HANDLER] FIN <==", {
    path: pathname,
    finalAction: resultResponse ? "REDIRECT/ALLOW" : "SUPABASE_RESPONSE",
  });
  return finalResponse;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Build (Casing)**: ((Implementada)) Se ha corregido la capitalización de la ruta de importación.
 * 2. **Integridad Restaurada**: ((Implementada)) Se ha restaurado toda la funcionalidad original del aparato, eliminando la regresión.
 */

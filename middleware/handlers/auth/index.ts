// middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Manejador de middleware para autenticación. Ha sido refactorizado
 *              a una arquitectura de máquina de estados declarativa para máxima
 *              claridad, mantenibilidad y robustez.
 * @author L.I.A Legacy
 * @version 11.0.0 (State Machine Architecture)
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

type UserStatus =
  | { state: "UNAUTHENTICATED" }
  | { state: "AUTHENTICATED"; authData: UserAuthData; needsOnboarding: boolean }
  | { state: "DEV_MODE" };

async function getUserSessionStatus(request: NextRequest): Promise<UserStatus> {
  if (process.env.DEV_MODE_ENABLED === "true") {
    return { state: "DEV_MODE" };
  }

  const authData = await getAuthenticatedUserAuthData();
  if (!authData) {
    return { state: "UNAUTHENTICATED" };
  }

  if (authData.activeWorkspaceId) {
    return { state: "AUTHENTICATED", authData, needsOnboarding: false };
  }

  const firstWorkspace = await getFirstWorkspaceForUser(authData.user.id);
  return { state: "AUTHENTICATED", authData, needsOnboarding: !firstWorkspace };
}

function handleUnauthenticatedUser(
  request: NextRequest,
  pathnameWithoutLocale: string,
  locale: string
): NextResponse | null {
  const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );

  if (isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
    if (request.nextUrl.pathname.startsWith("/")) {
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return null;
}

function handleAuthenticatedUser(
  request: NextRequest,
  authData: UserAuthData,
  needsOnboarding: boolean,
  pathnameWithoutLocale: string,
  locale: string
): NextResponse | null {
  const { origin, searchParams } = request.nextUrl;
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

  if (needsOnboarding && pathnameWithoutLocale !== "/welcome") {
    return NextResponse.redirect(new URL(`/${locale}/welcome`, origin));
  }

  if (!needsOnboarding && pathnameWithoutLocale === "/welcome") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }

  // Role-based checks
  if (
    pathnameWithoutLocale.startsWith("/dev-console") &&
    authData.appRole !== "developer"
  ) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }
  if (
    pathnameWithoutLocale.startsWith("/admin") &&
    !["admin", "developer"].includes(authData.appRole)
  ) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, origin));
  }

  return null;
}

export async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const locale = response.headers.get("x-app-locale") || "pt-BR";
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const { response: supabaseResponse } = await createClient(request);
  let userStatus: UserStatus;

  try {
    userStatus = await getUserSessionStatus(request);
  } catch (error) {
    logger.error(
      "[AUTH_HANDLER] Fallo crítico al obtener estado de sesión:",
      error
    );
    userStatus = { state: "UNAUTHENTICATED" };
  }

  let resultResponse: NextResponse | null = null;

  switch (userStatus.state) {
    case "DEV_MODE":
      return response; // Bypass
    case "UNAUTHENTICATED":
      resultResponse = handleUnauthenticatedUser(
        request,
        pathnameWithoutLocale,
        locale
      );
      break;
    case "AUTHENTICATED":
      resultResponse = handleAuthenticatedUser(
        request,
        userStatus.authData,
        userStatus.needsOnboarding,
        pathnameWithoutLocale,
        locale
      );
      break;
  }

  return resultResponse || supabaseResponse;
}

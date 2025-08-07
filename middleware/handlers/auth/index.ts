// middleware/handlers/auth/index.ts
/**
 * @file auth/index.ts
 * @description Motor de reglas de autorización. Ha sido refactorizado para
 *              eliminar la redirección de onboarding a /welcome, alineándose
 *              con la creación automática de workspaces.
 * @author L.I.A Legacy
 * @version 5.0.0 (Automatic Onboarding Alignment)
 */
import { type NextRequest, NextResponse } from "next/server";

import {
  getAuthDataForMiddleware,
  type UserAuthData,
} from "@/lib/auth/middleware-permissions";
import { logger as middlewareLogger } from "@/lib/logging";
import { ROUTE_MANIFEST, type RouteSecurityRule } from "@/lib/routing-manifest";
import { createClient } from "@/lib/supabase/middleware";

type Logger = typeof middlewareLogger;

function findMatchingRouteRule(
  pathname: string
): RouteSecurityRule | undefined {
  return ROUTE_MANIFEST.find((rule) => pathname.startsWith(rule.path));
}

function handleUnauthenticated(
  request: NextRequest,
  rule: RouteSecurityRule,
  pathname: string,
  locale: string,
  logger: Logger
): NextResponse | null {
  if (rule.classification === "protected") {
    const loginUrl = new URL(`/${locale}/auth/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    logger.info(
      "[AUTH] Unauthenticated user on protected route. Redirecting to login.",
      { from: pathname, to: loginUrl.pathname }
    );
    return NextResponse.redirect(loginUrl);
  }
  return null;
}

function handleAuthenticated(
  request: NextRequest,
  authData: UserAuthData,
  rule: RouteSecurityRule,
  pathname: string,
  locale: string,
  logger: Logger
): NextResponse | null {
  const { origin } = request.nextUrl;
  const dashboardUrl = new URL(`/${locale}/dashboard`, origin);

  if (rule.classification === "auth") {
    logger.info(
      "[AUTH] Authenticated user on auth route. Redirecting to dashboard.",
      { from: pathname }
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // --- INICIO DE REFACTORIZACIÓN CRÍTICA ---
  // Se elimina la lógica de `needsOnboarding`. El DashboardLayout ahora es
  // responsable de establecer el contexto del workspace inicial.
  // --- FIN DE REFACTORIZACIÓN CRÍTICA ---

  if (rule.classification === "protected" && rule.requiredRoles) {
    if (!rule.requiredRoles.includes(authData.appRole)) {
      logger.warn("[AUTH] Permission denied for route. Redirecting.", {
        userId: authData.user.id,
        role: authData.appRole,
        required: rule.requiredRoles,
        path: pathname,
      });
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return null;
}

export async function handleAuth(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  logger.trace("==> [AUTH_HANDLER] START <==", { path: pathname });

  const locale = response.headers.get("x-app-locale") || "pt-BR";
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const { response: supabaseResponse } = await createClient(request, response);
  const authData = await getAuthDataForMiddleware();

  let rule = findMatchingRouteRule(pathnameWithoutLocale);

  if (!rule) {
    logger.warn(
      "[AUTH] No explicit rule found in manifest. Applying secure default.",
      { path: pathnameWithoutLocale }
    );
    rule = { path: pathnameWithoutLocale, classification: "protected" };
  }

  let redirectResponse: NextResponse | null = null;
  if (!authData) {
    redirectResponse = handleUnauthenticated(
      request,
      rule,
      pathname,
      locale,
      logger
    );
  } else {
    redirectResponse = handleAuthenticated(
      request,
      authData,
      rule,
      pathnameWithoutLocale,
      locale,
      logger
    );
  }

  logger.trace("==> [AUTH_HANDLER] END <==", {
    path: pathname,
    action: redirectResponse ? "REDIRECT" : "PASS",
  });

  return redirectResponse || supabaseResponse;
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Alineación con Onboarding Automático**: ((Implementada)) Se ha eliminado la lógica de redirección a `/welcome`, delegando la responsabilidad de establecer el contexto inicial al `DashboardLayout`.
 *
 * @subsection Melhorias Futuras
 * 1. **Redirección a Página de 'No Autorizado'**: ((Vigente)) En lugar de redirigir a /dashboard por falta de rol, se podría redirigir a una página específica `/unauthorized` para una mejor UX.
 */
// middleware/handlers/auth/index.ts

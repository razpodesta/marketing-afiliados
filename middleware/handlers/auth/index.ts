// middleware/handlers/auth/index.ts
/**
 * @file middleware/handlers/auth/index.ts
 * @description Handler de middleware para autenticação e proteção de rotas.
 *              Orquestra o acesso a rotas baseando-se no estado de autenticação
 *              e roles do usuário, redirecionando para garantir a segurança e o fluxo correto.
 * @author L.I.A Legacy
 * @version 6.3.0 (Centralized Permissions Integration)
 */
import { type NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserAuthData } from "@/lib/auth/user-permissions"; // <-- NOVA IMPORTAÇÃO

import { getFirstWorkspaceForUser } from "../../../lib/data/workspaces";
import { logger } from "../../../lib/logging";
import { createClient } from "../../../lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/dev-console",
  "/welcome",
  "/lia-chat",
];
const ADMIN_DEV_ROUTES = ["/admin", "/dev-console"]; // Renomeado para clareza
const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROOT = "/";

/**
 * @async
 * @function handleAuth
 * @description Gerencia o fluxo de autenticação para requisições entrantes.
 *              Redireciona usuários não autenticados para rotas protegidas
 *              e usuários autenticados para o dashboard se estiverem em rotas de autenticação.
 *              Também garante que usuários administrativos/desenvolvedores
 *              tenham acesso às suas respectivas rotas.
 * @param {NextRequest} request - O objeto da requisição Next.js.
 * @param {NextResponse} response - O objeto da resposta Next.js (do handler anterior no pipeline).
 * @returns {Promise<NextResponse>} A resposta modificada ou um redirecionamento.
 */
export async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const locale = response.headers.get("x-app-locale") || "pt-BR";

  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.trace("[AUTH_HANDLER] Bypass por Modo de Desenvolvimento ativado.");
    return response;
  }

  const { supabase, response: supabaseResponse } = await createClient(request);
  // Não precisamos mais do session aqui diretamente para o estado de autenticação principal,
  // pois getAuthenticatedUserAuthData() fará isso de forma unificada.
  // No entanto, createClient(request) já chama getUser(), então suas cookies serão atualizadas.

  const authData = await getAuthenticatedUserAuthData(); // Carrega user, appRole e workspace roles

  const { pathname, origin } = request.nextUrl;
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  logger.trace(
    { isAuthenticated: !!authData, path: pathnameWithoutLocale },
    "[AUTH_HANDLER] Verificando estado."
  );

  const isProtectedRoute = PROTECTED_ROUTES.some((route: string) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route: string) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isPublicRoot = pathnameWithoutLocale === PUBLIC_ROOT;

  if (!authData) {
    // Usuário NÃO autenticado
    if (isProtectedRoute) {
      logger.warn(
        `[AUTH_HANDLER] Acesso não autenticado bloqueado: ${pathname}. Redirecionando para login.`
      );
      const loginUrl = new URL(`/${locale}/login`, origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    logger.trace(
      "[AUTH_HANDLER] Usuário não autenticado em rota pública. Permitido."
    );
    return supabaseResponse; // Permite que a requisição continue
  }

  // Usuário AUTENTICADO
  if (isAuthRoute || isPublicRoot) {
    logger.info(
      `[AUTH_HANDLER] Usuário autenticado em rota de auth ou raiz. Redirecionando para dashboard.`
    );
    const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // Lógica para definir/redirecionar para o primeiro workspace se não houver um ativo
  const workspaceCookie = request.cookies.get("active_workspace_id");
  if (!workspaceCookie && pathnameWithoutLocale !== "/welcome") {
    // Evita loop de redirecionamento para /welcome
    const firstWorkspace = await getFirstWorkspaceForUser(authData.user.id);
    if (firstWorkspace) {
      logger.info(
        `[AUTH_HANDLER] Estabelecendo workspace ativo para ${authData.user.id}`
      );
      // set the cookie on the supabaseResponse to propagate it
      supabaseResponse.cookies.set("active_workspace_id", firstWorkspace.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
      // Redirect to the current URL to re-run middleware with the new cookie
      return NextResponse.redirect(request.url, {
        headers: supabaseResponse.headers,
      });
    } else {
      // Se não há workspace e não estamos na página de boas-vindas, redirecionar
      const welcomeUrl = new URL(`/${locale}/welcome`, origin);
      return NextResponse.redirect(welcomeUrl);
    }
  }

  // Verificação de role para rotas administrativas/dev
  const isAdminDevRoute = ADMIN_DEV_ROUTES.some((route: string) =>
    pathnameWithoutLocale.startsWith(route)
  );
  if (isAdminDevRoute) {
    const allowedRoles = ["admin", "developer"];
    if (!authData.appRole || !allowedRoles.includes(authData.appRole)) {
      logger.warn(
        `[AUTH_HANDLER] Acesso de role não autorizado a ${pathname}. Role: '${authData.appRole}'. Redirecionando.`
      );
      const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Log de Auditoria para Eventos de Autenticação: Integrar `createAuditLog` para registrar logins bem-sucedidos/falhos, mudanças de sessão, e redirecionamentos por falta de permissão, fornecendo uma trilha de auditoria completa.
 * 2. Mensagens de Erro Personalizadas na Redireção: Quando redirecionar para `/login` ou `/dashboard` devido a erros de autenticação/autorização, passar parâmetros de query (`?error=...`) mais específicos para que a página de destino possa exibir mensagens personalizadas e úteis ao usuário.
 * 3. Cache de Decisões de Role no Edge: Para ambientes de alto tráfego, considerar cachear as decisões de role do usuário (seja no `authData` ou um flag simples) no Edge (e.g., Vercel Edge Config ou um cookie de sessão assinado) por um curto período para reduzir a latência de verificação de permissões em cada requisição. (Já otimizado pelo cache interno do user-permissions).
 * 4. Tratamento de "Session Revoked": Se a sessão for inválida (e.g., token expirado, revogado), garantir que a resposta do Supabase seja corretamente tratada para forçar o logout e redirecionamento para a página de login, e não para um loop ou estado de erro.
 * 5. Middleware Pipeline Refinado: O middleware atual já é um pipeline. Para cenários muito complexos, pode-se explorar uma classe `MiddlewarePipeline` como uma abstração extra para registrar e executar handlers, embora a implementação atual seja bastante limpa.
 */

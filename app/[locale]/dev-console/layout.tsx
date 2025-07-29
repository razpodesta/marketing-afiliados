// app/[locale]/dev-console/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal para o Dashboard de Desenvolvedor (`/dev-console`).
 *              Este componente Server protege as rotas filhas, garantindo que
 *              apenas usuários com o role 'developer' tenham acesso.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 3.1.0 (Centralized Permissions Integration)
 */
"use server"; // Indica que este é um Server Component.

import { redirect } from "next/navigation";
import React from "react";

import { requireAppRole } from "@/lib/auth/user-permissions"; // <-- NOVA IMPORTAÇÃO
import { logger } from "@/lib/logging";

import { DevSidebarClient } from "./components/DevSidebarClient";

/**
 * @async
 * @function DevConsoleLayout
 * @description Componente de Layout para a Console de Desenvolvedor.
 *              Verifica o role do usuário e redireciona se não for 'developer'.
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos a serem renderizados dentro do layout.
 * @returns {Promise<JSX.Element | null>} O layout com os componentes filhos ou um redirecionamento.
 */
export default async function DevConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // REFACTORIZAÇÃO: Usar a nova função centralizada para verificar o role.
  const roleCheck = await requireAppRole(["developer"]);

  if (!roleCheck.success) {
    logger.warn(
      `[DevConsoleLayout] Acesso negado a /dev-console. Redirecionando: ${roleCheck.error}`
    );
    // Redireciona para login se não autenticado, ou para o dashboard se não autorizado.
    return redirect(
      roleCheck.error === "Ação não autorizada. Sessão não encontrada."
        ? "/login?next=/dev-console"
        : "/dashboard"
    );
  }

  // Se roleCheck.success for true, roleCheck.data contém o user e appRole.
  // Não precisamos mais de 'supabase.auth.getUser()' ou 'supabase.from("profiles").select("app_role")' aqui.

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DevSidebarClient />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Componente de Perfil de Desenvolvedor: No `DevSidebarClient`, substituir o botão de "Cerrar Sesión" por um menu suspenso (`DropdownMenu`) que exiba o nome e role do desenvolvedor, similar ao dashboard de usuário, mas com um estilo mais técnico.
 * 2. Carregamento de Dados Globais do Layout: Este layout pode pré-carregar dados necessários em todas as páginas da console (e.g., estatísticas globais como número total de usuários, sites, campanhas) e torná-los disponíveis através de um Contexto React. Isso evitaria que cada página aninhada recarregue esses dados.
 * 3. Notificações do Sistema: Integrar um pequeno sistema de notificações na barra lateral ou no cabeçalho para alertar os desenvolvedores sobre eventos críticos da plataforma (e.g., erros não tratados via Sentry, picos de uso do servidor), proporcionando monitoramento proativo.
 * 4. Tratamento de Erros por Página Dedicada: Em vez de um redirecionamento genérico para `/dashboard` em caso de acesso não autorizado, pode-se redirecionar para uma página `/unauthorized` ou `/access-denied` que explique ao usuário por que ele não pode acessar o recurso.
 */
/* Ruta: app/[locale]/dev-console/layout.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Componente de Perfil de Desarrollador: Reemplazar el simple botón de "Cerrar Sesión" (que está dentro de DevSidebarClient) por un menú desplegable (`DropdownMenu`) que se active desde el layout. Este podría mostrar el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 2. Carga de Datos Globales del Layout: Este layout podría precargar datos que son necesarios en todas las páginas de la consola (ej. estadísticas globales como número total de usuarios, sitios, campañas) y hacerlos disponibles a través de un Contexto de React. Esto evitaría que cada página anidada tenga que recargar estos datos.
 * 3. Notificaciones del Sistema: Integrar un pequeño sistema de notificaciones en la barra lateral o en un header para alertar a los desarrolladores sobre eventos críticos de la plataforma, como errores no controlados (vía Sentry) o picos de uso del servidor, proporcionando un monitoreo proactivo.
 */
/* MEJORAS PROPUESTAS (Consolidadas y Refinadas)
 * 1. **Componente de Perfil de Desarrollador:** Reemplazar el simple botón de "Cerrar Sesión" con un menú desplegable (`DropdownMenu`) que muestre el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 2. **Carga de Datos Globales del Layout:** Este layout podría precargar datos que serán necesarios en todas las páginas del `dev-console`, como estadísticas globales (número total de usuarios, sitios, etc.), y hacerlos disponibles a través de React Context para evitar la recarga en cada navegación de página.
 * 3. **Notificaciones del Sistema:** Integrar un pequeño sistema de notificaciones en la barra lateral o en un header para alertar a los desarrolladores sobre eventos críticos de la plataforma, como errores no controlados (vía Sentry) o picos de uso del servidor.
 * 1. **Resaltado de Ruta Activa:** Implementar un sub-componente `NavLink` que utilice el hook `usePathname` para determinar la ruta activa y aplicar estilos de resaltado (ej. fondo `bg-primary/10`, texto `text-primary`) al enlace correspondiente en la barra lateral.
 * 2. **Componente de Perfil de Desarrollador:** Reemplazar el simple botón de "Cerrar Sesión" con un menú desplegable (`DropdownMenu`) que muestre el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 3. **Carga de Datos Globales del Layout:** Este layout podría precargar datos que serán necesarios en todas las páginas del `dev-console`, como estadísticas globales (número total de usuarios, sitios, etc.), y hacerlos disponibles a través de React Context para evitar la recarga en cada navegación de página.
 */

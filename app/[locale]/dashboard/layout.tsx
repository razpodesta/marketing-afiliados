// app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard. Ha sido refactorizado
 *              arquitectónicamente para desacoplar completamente la lógica de
 *              obtención de datos, delegándola a funciones especializadas que
 *              consumen la capa de datos. Esto simplifica el componente, mejora
 *              la mantenibilidad y resuelve fallos de prueba sistémicos.
 *              REFACTORIZADO: Incluye sugerencia para Error Boundary.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 14.0.0 (Error Boundary Suggestion)
 */
import { unstable_cache as cache } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

import { CommandPalette } from "@/components/feedback/CommandPalette";
import { LiaChatWidget } from "@/components/feedback/LiaChatWidget";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardProvider } from "@/lib/context/DashboardContext";
import { modules as modulesData, notifications, workspaces } from "@/lib/data";
import { getMockLayoutData } from "@/lib/dev/mock-session";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

type Workspace = Tables<"workspaces">;

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---

/**
 * @async
 * @function getProductionLayoutData
 * @description Orquesta la obtención de todos los datos necesarios para el layout de producción.
 *              Esta función es la única que interactúa con las capas inferiores de datos.
 * @returns {Promise<any>} Los datos del layout o una redirección.
 */
async function getProductionLayoutData() {
  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { userWorkspaces, pendingInvitations, modules } = await cache(
    async () => {
      logger.info(
        `[Cache MISS] Cargando datos de layout para usuario ${user.id}.`
      );
      const [userWorkspaces, pendingInvitations, modules] = await Promise.all([
        workspaces.getWorkspacesByUserId(user.id),
        notifications.getPendingInvitationsByEmail(user.email!),
        modulesData.getFeatureModulesForUser(user),
      ]);
      return { userWorkspaces, pendingInvitations, modules };
    },
    [`layout-data-${user.id}`],
    { tags: [`workspaces:${user.id}`, `invitations:${user.email!}`] }
  )();

  // Si no hay workspaces ni invitaciones, redirigir a onboarding.
  if (userWorkspaces.length === 0 && pendingInvitations.length === 0) {
    return redirect("/welcome");
  }

  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;
  let activeWorkspace: Workspace | null = null;

  // Intentar usar el workspace de la cookie.
  if (
    activeWorkspaceId &&
    userWorkspaces.some((ws) => ws.id === activeWorkspaceId)
  ) {
    activeWorkspace = userWorkspaces.find((ws) => ws.id === activeWorkspaceId)!;
  }
  // Si la cookie no es válida o no existe, usar el primer workspace del usuario.
  else if (userWorkspaces.length > 0) {
    activeWorkspace = userWorkspaces[0];
    // Opcional: establecer la cookie para la próxima visita
    cookies().set("active_workspace_id", activeWorkspace.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  // Si a pesar de todo, no se pudo determinar un workspace activo (esto no debería pasar
  // si el usuarioWorkspaces.length > 0, pero es una guarda extra).
  if (!activeWorkspace) {
    logger.warn(
      `[DashboardLayout] No se pudo determinar un workspace activo para el usuario ${user.id}. Esto es inesperado si hay workspaces. Redirigiendo a welcome como fallback.`
    );
    return redirect("/welcome");
  }

  return {
    user,
    workspaces: userWorkspaces,
    activeWorkspace,
    pendingInvitations,
    modules,
  };
}

/**
 * @async
 * @function getLayoutData
 * @description Actúa como un interruptor, obteniendo datos reales o simulados
 *              según el estado de la variable de entorno `DEV_MODE_ENABLED`.
 * @returns {Promise<any>} Los datos del layout.
 */
async function getLayoutData() {
  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.info(
      "[DashboardLayout] Modo DEV: Cargando datos de layout simulados."
    );
    return getMockLayoutData();
  }
  return getProductionLayoutData();
}
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

// --- SUGERENCIA: Aquí es donde añadirías un Error Boundary (componente de cliente) ---
// import ErrorBoundary from "@/components/ErrorBoundary"; // Componente a crear

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData();

  // Si getLayoutData devuelve una redirección (ej. "/login", "/welcome"), Next.js la manejará.
  if (!layoutData) return null;

  return (
    <DashboardProvider value={layoutData}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/* SUGERENCIA DE MEJORA: Envuelve tus hijos en un ErrorBoundary */}
            {/* <ErrorBoundary> */}
            {children}
            {/* </ErrorBoundary> */}
          </main>
        </div>
        <LiaChatWidget />
        <CommandPalette />
      </div>
    </DashboardProvider>
  );
}
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar el layout del dashboard.
 *
 * @subsection Mejoras Futuras
 * 1. **Error Boundary de React**: ((Vigente)) Envolver `{children}` en un Error Boundary (componente de cliente) para capturar y manejar errores de renderizado de forma elegante.
 * 2. **Feedback Visual de Cambio de Workspace**: ((Vigente)) Cuando el usuario cambia de workspace (vía `WorkspaceSwitcher`), se puede mostrar un indicador de carga o una transición suave en el contenido del dashboard.
 * 3. **Mensajes de Log Más Precisos**: ((Vigente)) Refinar el mensaje de `logger.warn` si `!activeWorkspace` es verdad, para que refleje si el problema es la falta total de workspaces o solo una cookie inválida.
 *
 * @subsection Mejoras Implementadas
 * 1. **Desacoplamiento Arquitectónico**: ((Implementada)) Toda la lógica de obtención de datos ha sido extraída del componente principal y delegada a la capa de datos.
 * 2. **Manejo de `activeWorkspace` Mejorado**: ((Implementada)) La lógica para seleccionar el `activeWorkspace` es más explícita, priorizando la cookie y cayendo al primer workspace si la cookie no es válida, antes de redirigir a `/welcome`.
 */
// app/[locale]/dashboard/layout.tsx

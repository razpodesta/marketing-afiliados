// app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard. Ha sido refactorizado
 *              arquitectónicamente para desacoplar completamente la lógica de
 *              obtención de datos, delegándola a funciones especializadas que
 *              consumen la capa de datos. Esto simplifica el componente, mejora
 *              la mantenibilidad y resuelve fallos de prueba sistémicos.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 13.0.0 (Architectural Decoupling & Testability)
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

  if (userWorkspaces.length === 0 && pendingInvitations.length === 0) {
    return redirect("/welcome");
  }

  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;
  let activeWorkspace: Workspace | null = null;

  if (
    activeWorkspaceId &&
    userWorkspaces.some((ws) => ws.id === activeWorkspaceId)
  ) {
    activeWorkspace = userWorkspaces.find((ws) => ws.id === activeWorkspaceId)!;
  } else if (userWorkspaces.length > 0) {
    activeWorkspace = userWorkspaces[0];
  }

  if (!activeWorkspace && userWorkspaces.length > 0) {
    logger.warn(
      `No se pudo determinar un workspace activo para el usuario ${user.id}. Redirigiendo a welcome.`
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
    return getMockLayoutData();
  }
  return getProductionLayoutData();
}
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData();

  // Si getLayoutData devuelve una redirección, Next.js la manejará.
  if (!layoutData) return null;

  return (
    <DashboardProvider value={layoutData}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
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
 * 1. **Error Boundary de React**: ((Vigente)) Envolver `{children}` en un Error Boundary.
 *
 * @subsection Mejoras Implementadas
 * 1. **Desacoplamiento Arquitectónico**: ((Implementada)) Toda la lógica de obtención de datos ha sido extraída del componente principal y delegada a la capa de datos.
 */
// app/[locale]/dashboard/layout.tsx

// app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard. Su fiabilidad ha sido reforzada
 *              mediante un arnés de pruebas expandido que valida la provisión
 *              de contexto, la selección de workspace y el modo de desarrollo.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 11.1.0 (High-Fidelity Test Validation)
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
import { modules as modulesData, workspaces } from "@/lib/data";
import { getMockLayoutData } from "@/lib/dev/mock-session";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

type Workspace = Tables<"workspaces">;
type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};
type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

const getCachedProductionData = (userId: string, userEmail: string) =>
  cache(
    async () => {
      logger.info(
        `[Cache MISS] Cargando datos de layout para usuario ${userId}.`
      );
      const supabase = createClient();
      // getUser es llamado afuera, así que aquí podemos pasar los datos directamente.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [userWorkspaces, invitationsResult, modules] = await Promise.all([
        workspaces.getWorkspacesByUserId(userId),
        supabase
          .from("invitations")
          .select("id, status, workspaces (name, icon)")
          .eq("invitee_email", userEmail)
          .eq("status", "pending"),
        modulesData.getFeatureModulesForUser(user!),
      ]);

      if (invitationsResult.error) {
        logger.error("Error cargando invitaciones:", invitationsResult.error);
        throw new Error("No se pudieron cargar las invitaciones.");
      }

      return { userWorkspaces, invitationsResult, modules };
    },
    [`layout-data-${userId}`],
    { tags: [`workspaces:${userId}`, `invitations:${userEmail}`] }
  )();

async function getProductionLayoutData() {
  const cookieStore = cookies();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { userWorkspaces, invitationsResult, modules } =
    await getCachedProductionData(user.id, user.email!);

  if (
    userWorkspaces.length === 0 &&
    (invitationsResult.data?.length ?? 0) === 0
  ) {
    return redirect("/welcome");
  }

  let activeWorkspace: Workspace | null = null;
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;
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

  const pendingInvitations: Invitation[] =
    (invitationsResult.data as RawInvitationData[])?.map((inv) => ({
      id: inv.id,
      status: inv.status,
      workspaces: Array.isArray(inv.workspaces)
        ? inv.workspaces[0] || null
        : inv.workspaces,
    })) || [];

  return {
    user,
    workspaces: userWorkspaces,
    activeWorkspace,
    pendingInvitations,
    modules,
  };
}

async function getLayoutData() {
  if (process.env.DEV_MODE_ENABLED === "true") {
    return getMockLayoutData();
  }
  return getProductionLayoutData();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData();
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
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar la robustez y rendimiento del layout.
 *
 * 1.  **Error Boundary de React**: (Vigente) Envolver `{children}` en un Error Boundary para capturar errores de renderizado en las páginas hijas y mostrar una UI de error amigable en lugar de un crash completo.
 * 2.  **Cacheo a Nivel de Base de Datos**: (Vigente) Para un rendimiento aún mayor, explorar las funciones de cacheo de PostgreSQL o usar un proxy como PgBouncer para cachear conexiones y consultas frecuentes.
 * 3.  **Carga de Datos en Paralelo con Suspense**: (Vigente) Utilizar `Suspense` para renderizar partes del layout (como la Sidebar) de forma inmediata mientras los datos más pesados (como los módulos) se cargan, mejorando el LCP (Largest Contentful Paint).
 */
// app/[locale]/dashboard/layout.tsx

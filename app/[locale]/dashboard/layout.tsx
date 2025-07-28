/**
 * @file layout.tsx
 * @description Layout principal para toda la sección del dashboard.
 * @refactor
 * REFACTORIZACIÓN CRÍTICA DE CACHÉ Y TIPOS:
 * 1. Resuelto el error de ejecución al eliminar la escritura de cookies (`cookieStore.set`),
 *    cuya lógica ha sido movida al middleware.
 * 2. Corregido el error de tipo implícito 'any' en el mapeo de invitaciones.
 *
 * @author Metashark
 * @version 6.3.0 (Cookie Logic Removal & Type Fix)
 */
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { LiaChatWidget } from "@/components/dashboard/LiaChatWidget";
import { DashboardProvider } from "@/lib/context/DashboardContext";
import { getFeatureModulesForUser } from "@/lib/data/modules";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import { unstable_cache as cache } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

type Workspace = Tables<"workspaces">;
type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

// Tipo para los datos de invitación crudos de la DB para un tipado seguro
type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

async function getLayoutData() {
  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const getWorkspacesAndInvitations = cache(
    async (
      supabaseClient: ReturnType<typeof createClient>,
      userId: string,
      userEmail: string
    ) => {
      logger.info(
        `[Cache] MISS: Cargando workspaces/invitaciones para ${userId}`
      );
      const [workspacesResult, invitationsResult] = await Promise.all([
        supabaseClient.from("workspaces").select("*"),
        supabaseClient
          .from("invitations")
          .select("id, status, workspaces (name, icon)")
          .eq("invitee_email", userEmail)
          .eq("status", "pending"),
      ]);
      return { workspacesResult, invitationsResult };
    },
    [`ws-invites-data-${user.id}`],
    { tags: [`workspaces:${user.id}`, `invitations:${user.id}`] }
  );

  const [{ workspacesResult, invitationsResult }, modules] = await Promise.all([
    getWorkspacesAndInvitations(supabase, user.id, user.email!),
    getFeatureModulesForUser(user),
  ]);

  if (workspacesResult.error) {
    logger.error(
      "Error cargando workspaces en el layout:",
      workspacesResult.error
    );
    throw new Error("No se pudieron cargar los datos del workspace.");
  }
  if (invitationsResult.error) {
    logger.error(
      "Error cargando invitaciones en el layout:",
      invitationsResult.error
    );
    throw new Error("No se pudieron cargar las invitaciones.");
  }

  const workspaces: Workspace[] = workspacesResult.data || [];
  if (workspaces.length === 0) return redirect("/welcome");

  const pendingInvitations: Invitation[] =
    (invitationsResult.data as RawInvitationData[])?.map(
      (inv: RawInvitationData) => ({
        id: inv.id,
        status: inv.status,
        workspaces: Array.isArray(inv.workspaces)
          ? inv.workspaces[0] || null
          : inv.workspaces,
      })
    ) || [];

  let activeWorkspace: Workspace | null = null;
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  if (
    activeWorkspaceId &&
    workspaces.some((ws) => ws.id === activeWorkspaceId)
  ) {
    activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId)!;
  } else if (workspaces.length > 0) {
    activeWorkspace = workspaces[0];
    // CORRECCIÓN: La lógica de escritura de cookies se ha eliminado de aquí.
  }

  return { user, workspaces, activeWorkspace, pendingInvitations, modules };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData();

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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Invalidación de Caché por Tags: Las Server Actions que modifican datos (ej. `createWorkspaceAction`, `acceptInvitationAction`) deben llamar a `revalidateTag` para invalidar la caché. (IMPLEMENTADO EN ACTION)
 * 2. Error Boundary de React: Envolver la llamada a `getLayoutData` en un Error Boundary de React para capturar errores de base de datos y mostrar una página de error amigable en lugar de un crash de la aplicación.
 * 3. Cacheo a Nivel de Base de Datos: Para un rendimiento aún mayor, se podrían explorar las funciones de cacheo de PostgreSQL o usar un proxy como PgBouncer para cachear conexiones y consultas frecuentes.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Error Boundary de React: Envolver la llamada a `getLayoutData` en un Error Boundary de React para capturar errores de base de datos y mostrar una página de error amigable en lugar de un crash de la aplicación.
 * 2. Cacheo a Nivel de Base de Datos: Para un rendimiento aún mayor, se podrían explorar las funciones de cacheo de PostgreSQL o usar un proxy como PgBouncer para cachear conexiones y consultas frecuentes.
 * 3. Carga de Datos en Paralelo con Suspense: Utilizar `Suspense` para renderizar partes del layout (como la Sidebar) de forma inmediata mientras los datos más pesados (como los módulos) se cargan, mejorando el LCP.
 */

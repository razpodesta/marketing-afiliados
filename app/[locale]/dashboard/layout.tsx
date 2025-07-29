// app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard.
 * @author L.I.A Legacy
 * @version 9.2.1 (API Contract Fix)
 */
import { CommandPalette } from "@/components/feedback/CommandPalette";
import { LiaChatWidget } from "@/components/feedback/LiaChatWidget";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardProvider } from "@/lib/context/DashboardContext";
import {
  modules as modulesData,
  sites as sitesData,
  workspaces,
} from "@/lib/data";
import { getMockLayoutData } from "@/lib/dev/mock-session";
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
type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

async function getProductionLayoutData() {
  const cookieStore = cookies();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const getWorkspacesAndInvitations = cache(
    async () => {
      const [ws, inv] = await Promise.all([
        workspaces.getWorkspacesByUserId(user.id),
        supabase
          .from("invitations")
          .select("id, status, workspaces (name, icon)")
          .eq("invitee_email", user.email!)
          .eq("status", "pending"),
      ]);
      return { workspaces: ws, invitationsResult: inv };
    },
    [`ws-invites-data-${user.id}`],
    { tags: [`workspaces:${user.id}`, `invitations:${user.id}`] }
  );

  const [{ workspaces: userWorkspaces, invitationsResult }, modules] =
    await Promise.all([
      getWorkspacesAndInvitations(),
      modulesData.getFeatureModulesForUser(user),
    ]);

  if (invitationsResult.error) {
    logger.error("Error cargando invitaciones:", invitationsResult.error);
    throw new Error("No se pudieron cargar las invitaciones.");
  }
  if (userWorkspaces.length === 0) return redirect("/welcome");

  let activeWorkspace: Workspace | null = null;
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;
  if (
    activeWorkspaceId &&
    userWorkspaces.some((ws: Workspace) => ws.id === activeWorkspaceId)
  ) {
    activeWorkspace = userWorkspaces.find(
      (ws: Workspace) => ws.id === activeWorkspaceId
    )!;
  } else if (userWorkspaces.length > 0) {
    activeWorkspace = userWorkspaces[0];
  }

  // Si no hay un workspace activo después de la lógica, no podemos continuar.
  if (!activeWorkspace) {
    logger.warn(
      `No se pudo determinar un workspace activo para el usuario ${user.id}. Redirigiendo a welcome.`
    );
    return redirect("/welcome");
  }

  // CORRECCIÓN: Se pasa el segundo argumento de opciones a la función.
  const { sites, totalCount } = await sitesData.getSitesByWorkspaceId(
    activeWorkspace.id,
    {}
  );

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

  return {
    user,
    workspaces: userWorkspaces,
    activeWorkspace,
    pendingInvitations,
    modules,
    sites,
    totalCount,
  };
}

async function getLayoutData() {
  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.warn("[DEV MODE] Sesión y datos de dashboard simulados.");
    return getMockLayoutData();
  }
  return await getProductionLayoutData();
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
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Error Boundary de React: Envolver `{children}` en un Error Boundary de React. Esto capturaría errores de renderizado en las páginas hijas y permitiría mostrar una UI de error amigable en lugar de un crash completo de la aplicación, mejorando la resiliencia.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Higher-Order Function (HOC) para Datos de Layout: La lógica `if (DEV_MODE) return mock else return real` podría ser abstraída en una función de orden superior, como `withDevModeData(realDataFetcher, mockDataFetcher)`, para hacer el código en `getLayoutData` aún más limpio y declarativo.
 * 2. Sincronización de Estado Simulada: El `mock-session.ts` podría exportar un objeto de estado simple (similar a un store de Zustand) que pueda ser modificado en tiempo de ejecución a través de la consola del navegador, permitiendo a los desarrolladores simular cambios de estado (como cambiar el workspace activo) sin recargar la página.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Higher-Order Function (HOC) para Datos de Layout: La lógica `if (DEV_MODE) return mock else return real` podría ser abstraída en una función de orden superior, como `withDevModeData(realDataFetcher, mockDataFetcher)`, para hacer el código en `getLayoutData` aún más limpio y declarativo.
 * 2. Sincronización de Estado Simulada: El `mock-session.ts` podría exportar un objeto de estado simple (similar a un store de Zustand) que pueda ser modificado en tiempo de ejecución a través de la consola del navegador, permitiendo a los desarrolladores simular cambios de estado (como cambiar el workspace activo) sin recargar la página.
 */
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

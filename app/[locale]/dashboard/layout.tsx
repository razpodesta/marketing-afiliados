// app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard. Refactorizado para operar
 *              exclusivamente en modo de producción y con las firmas de
 *              la capa de datos corregidas.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 18.0.0 (Production-Only & Type-Safe)
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
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

type Workspace = Tables<"workspaces">;

async function getLayoutData() {
  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    logger.info("[DashboardLayout] No session found, redirecting to login.");
    return redirect("/login");
  }

  logger.trace(`[DashboardLayout] Authenticated user found: ${user.id}`);

  const { userWorkspaces, pendingInvitations, modules } = await cache(
    async (supabaseClient, userObj) => {
      logger.info(`[Cache MISS] Fetching layout data for user ${userObj.id}.`);
      const [userWorkspaces, pendingInvitations, modules] = await Promise.all([
        workspaces.getWorkspacesByUserId(userObj.id, supabaseClient),
        notifications.getPendingInvitationsByEmail(
          userObj.email!,
          supabaseClient
        ),
        modulesData.getFeatureModulesForUser(userObj, supabaseClient),
      ]);
      return { userWorkspaces, pendingInvitations, modules };
    },
    [`layout-data-${user.id}`],
    { tags: [`workspaces:${user.id}`, `invitations:${user.email!}`] }
  )(supabase, user);

  if (userWorkspaces.length === 0 && pendingInvitations.length === 0) {
    logger.info(
      `[DashboardLayout] User ${user.id} requires onboarding. Redirecting to /welcome.`
    );
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
    cookies().set("active_workspace_id", activeWorkspace.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  if (!activeWorkspace) {
    logger.warn(
      `[DashboardLayout] Could not determine active workspace for ${user.id}.`
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
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Modo Exclusivo de Producción**: ((Implementada)) Se ha eliminado el `DEV_MODE`.
 * 2. **Sincronización de Tipos**: ((Implementada)) Las llamadas a la capa de datos ahora cumplen con las firmas correctas.
 *
 * @subsection Melhorias Futuras
 * 1. **Error Boundary**: ((Vigente)) Envolver `{children}` en un Error Boundary.
 */
// app/[locale]/dashboard/layout.tsx

// Ruta: app/[locale]/dashboard/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del dashboard. Responsable de la seguridad, la estructura
 *              visual y la provisión del contexto global para todas las páginas autenticadas.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 10.0.0 (Lean Data Fetching)
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
    userWorkspaces.some((ws) => ws.id === activeWorkspaceId)
  ) {
    activeWorkspace = userWorkspaces.find((ws) => ws.id === activeWorkspaceId)!;
  } else if (userWorkspaces.length > 0) {
    activeWorkspace = userWorkspaces[0];
  }

  if (!activeWorkspace) {
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

  // REFACTORIZACIÓN: Se eliminó la obtención de `sites` y `totalCount`.
  // Esta responsabilidad pertenece a la página `sites/page.tsx`, no al layout.
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
    logger.warn("[DEV MODE] Sesión y datos de dashboard simulados.");
    // NOTA: getMockLayoutData también deberá ser ajustado para no devolver `sites` y `totalCount`.
    // Asumimos esa corrección en el archivo correspondiente.
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
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la robustez y rendimiento del layout.
 *
 * 1.  **Error Boundary de React:** (Revalidado) Envolver `{children}` en un Error Boundary de React para capturar errores de renderizado en las páginas hijas y mostrar una UI de error amigable en lugar de un crash completo.
 * 2.  **Cacheo a Nivel de Base de Datos:** (Revalidado) Para un rendimiento aún mayor, explorar las funciones de cacheo de PostgreSQL o usar un proxy como PgBouncer para cachear conexiones y consultas frecuentes.
 * 3.  **Carga de Datos en Paralelo con Suspense:** (Revalidado) Utilizar `Suspense` para renderizar partes del layout (como la Sidebar) de forma inmediata mientras los datos más pesados (como los módulos) se cargan, mejorando el LCP (Largest Contentful Paint).
 */

/**
 * @fileoverview El aparato `dashboard/layout.tsx` es el esqueleto de la experiencia autenticada.
 * @functionality
 * - **Guardián de Acceso:** Es la primera barrera. Verifica la sesión del usuario. Si no existe, redirige a `/login`.
 * - **Orquestador de Onboarding:** Verifica si el usuario tiene workspaces. Si no, lo redirige a `/welcome`.
 * - **Proveedor de Contexto:** Obtiene todos los datos globales necesarios para la UI del dashboard (usuario, workspaces, invitaciones, módulos) y los inyecta en el `DashboardContext` para que estén disponibles en toda la aplicación cliente.
 * - **Renderizado Estructural:** Define la estructura visual principal del dashboard, incluyendo la `DashboardSidebar`, `DashboardHeader`, y el área de contenido principal donde se renderizarán las páginas hijas (`children`).
 * @relationships
 * - Es el layout padre de todas las rutas bajo `/dashboard`.
 * - Es el único lugar donde se debe instanciar el `DashboardProvider`.
 * - Depende de múltiples aparatos de la capa de datos (`lib/data/*`) para obtener su información.
 * - En modo de desarrollo, depende de `lib/dev/mock-session.ts` para los datos simulados.
 * @expectations
 * - Se espera que este componente sea altamente eficiente, ya que se renderiza en cada página del dashboard. Las consultas de datos deben ser optimizadas y cacheadas agresivamente. Su lógica debe ser exclusivamente para la obtención de datos y el renderizado del layout, sin contener lógica de negocio específica de ninguna página.
 */

/**
 * @fileoverview El aparato `dashboard/layout.tsx` es el esqueleto de la experiencia autenticada.
 * @functionality
 * - **Guardián de Acceso:** Es la primera barrera. Verifica la sesión del usuario. Si no existe, redirige a `/login`.
 * - **Orquestador de Onboarding:** Verifica si el usuario tiene workspaces. Si no, lo redirige a `/welcome`.
 * - **Proveedor de Contexto:** Obtiene todos los datos globales necesarios para la UI del dashboard (usuario, workspaces, etc.) y los inyecta en el `DashboardContext`.
 * - **Renderizado Estructural:** Define la estructura visual principal del dashboard, incluyendo la `DashboardSidebar` y `DashboardHeader`.
 * @relationships
 * - Es el layout padre de todas las rutas bajo `/dashboard`.
 * - Es el único lugar donde se debe instanciar el `DashboardProvider`.
 * - Depende de múltiples aparatos de la capa de datos (`lib/data/*`) para obtener su información.
 * @expectations
 * - Se espera que este componente sea altamente eficiente, con consultas de datos cacheadas agresivamente. Su lógica debe ser exclusivamente para la obtención de datos y el renderizado del layout, sin contener lógica de negocio específica de ninguna página.
 */
// Ruta: app/[locale]/dashboard/layout.tsx
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

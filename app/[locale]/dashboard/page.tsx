// app/[locale]/dashboard/page.tsx
/**
 * @file Página Principal del Dashboard del Suscriptor (Server Component)
 * @description Punto de entrada para el dashboard. Con la creación del cliente de servidor
 * de Supabase y el tipado explícito, esta página vuelve a ser funcional y segura.
 *
 * @author Metashark
 * @version 3.1.0 (Explicit Typing & Corrected Import)
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSitesByWorkspaceId, type Site } from "@/lib/data/sites";
import { DashboardClient } from "./dashboard-client";
import { logger } from "@/lib/logging";

// Helper para obtener el workspace del usuario
async function getUserWorkspaceId(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .single();
  if (error && error.code !== "PGRST116") {
    logger.error(`No se encontró workspace para el usuario ${userId}`, error);
    return null;
  }
  return data?.id ?? null;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const workspaceId = await getUserWorkspaceId(user.id);

  let sites: Site[] = [];
  if (workspaceId) {
    sites = await getSitesByWorkspaceId(workspaceId);
  } else {
    logger.warn(
      `El usuario ${user.id} ha iniciado sesión pero no tiene un workspace asociado.`
    );
  }

  return (
    <Suspense fallback={<p>Cargando tu dashboard...</p>}>
      <DashboardClient user={user} initialSites={sites} />
    </Suspense>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo.
 * 2. **Manejo de Errores de Carga:** Envolver las llamadas a la base de datos en un `try/catch`.
 * 3. **Página de "Crear Workspace":** Redirigir al usuario a `/create-workspace` si no tiene uno.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo.
 * 2. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para mostrar un componente de error en la UI si la base de datos falla.
 * 3. **Página de "Crear Workspace":** Si `workspaceId` es nulo, redirigir al usuario a una página `/create-workspace` para guiarlo.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para manejar elegantemente los casos en que la base de datos no esté disponible, mostrando un componente de error en la UI.
 * 3. **Página de "Crear Workspace":** Si `workspaceId` es nulo, en lugar de mostrar un dashboard vacío, redirigir al usuario a una página `/create-workspace` para guiarlo en su primer paso.
 */
/* MEJORAS PROPUESTAS
 * 1. **Gestión de Workspaces:** El siguiente paso lógico es implementar la lógica para establecer el `active_workspace_id` en la sesión del usuario al iniciar sesión o a través de un selector en la UI.
 * 2. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 3. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para manejar elegantemente los casos en que la base de datos no esté disponible.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Manejo de Errores de Carga:** Envolver `getTenantsByOwner` en un `try/catch` y pasar un estado de error al `DashboardClient` para mostrar un mensaje amigable si la base de datos no está disponible.
 * 3. **Componente de "Estado Vacío":** Si el usuario no tiene ninguna campaña, mostrar un componente amigable que lo invite a crear su primera campaña, en lugar de un simple texto.
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Layout de Dashboard:** Crear un `layout.tsx` en esta carpeta para añadir elementos compartidos como una barra lateral de navegación, que será necesaria cuando añadamos la gestión de campañas, facturación, etc.
 * 3. **Manejo de Errores de Carga:** Envolver `getTenantsByOwner` en un `try/catch` y pasar un estado de error al `DashboardClient` para mostrar un mensaje amigable si la base de datos no está disponible.
 * 1. **Carga de Datos del Tenant:** Crear una función `getTenantsByOwner(ownerId)` en `lib/platform/tenants.ts` y llamarla aquí para obtener y mostrar la lista de tenants del usuario.
 * 2. **Layout de Dashboard:** Crear un archivo `app/[locale]/dashboard/layout.tsx` que incluya una barra lateral de navegación y un encabezado comunes para todas las páginas dentro del dashboard.
 * 3. **Componente de "Estado Vacío":** Si el usuario no tiene ninguna campaña, mostrar un componente amigable que lo invite a crear su primera campaña, en lugar de un simple texto.
 */

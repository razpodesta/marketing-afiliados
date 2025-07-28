// Ruta: app/[locale]/dashboard/page.tsx
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { DashboardClient } from "./dashboard-client";

/**
 * @file page.tsx
 * @description Punto de entrada para la página del dashboard principal.
 *              Obtiene los datos iniciales necesarios para el Centro de Comando.
 * REFACTORIZACIÓN DE ESTABILIDAD:
 * 1.  Se ha añadido una guarda para asegurar que la prop `recentCampaigns`
 *     siempre sea un array, previniendo un error de runtime si no hay
 *     un workspace activo o si la consulta a la base de datos falla.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.1.0 (Data Stability Patch)
 */

const PageSkeleton = () => (
  <div className="flex h-full flex-col gap-8 animate-pulse">
    <div className="space-y-1">
      <div className="h-8 w-1/3 rounded-md bg-muted" />
      <div className="h-5 w-1/2 rounded-md bg-muted" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
    </div>
    <div className="space-y-4">
      <div className="h-6 w-1/4 rounded-md bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    </div>
  </div>
);

/**
 * @description Obtiene las campañas modificadas más recientemente para todos los sitios de un workspace.
 * @param workspaceId El ID del workspace activo.
 * @param limit El número de campañas a obtener.
 * @returns Una promesa que resuelve a un array de campañas.
 */
async function getRecentCampaignsForWorkspace(
  workspaceId: string,
  limit = 4
): Promise<Tables<"campaigns">[]> {
  const supabase = createClient();
  // Esta consulta ahora es más robusta:
  // 1. Obtiene los sitios que pertenecen al workspace.
  // 2. Luego obtiene las campañas que pertenecen a esos sitios.
  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (sitesError || !sites || sites.length === 0) {
    if (sitesError) {
      logger.error(
        `Error obteniendo sitios para el workspace ${workspaceId}`,
        sitesError
      );
    }
    return [];
  }

  const siteIds = sites.map((s) => s.id);

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("*")
    .in("site_id", siteIds)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (campaignsError) {
    logger.error(
      `Error al obtener campañas recientes para el workspace ${workspaceId}:`,
      campaignsError
    );
    return [];
  }
  return campaigns;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  let recentCampaignsData: Tables<"campaigns">[] = [];

  if (activeWorkspaceId) {
    recentCampaignsData =
      await getRecentCampaignsForWorkspace(activeWorkspaceId);
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardClient recentCampaigns={recentCampaignsData} />
    </Suspense>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Esqueleto de Carga Sofisticado: El componente `PageSkeleton` actual es muy simple. Podría ser reemplazado por un esqueleto más detallado que imite la estructura de `DashboardClient` (título, cuadrícula de tarjetas), mejorando la experiencia de carga percibida (LCP).
 * 2. Estado de Bienvenida Contextual: Aunque el layout redirige en el onboarding, esta página podría mostrar un componente especial de "Bienvenida" en la primera visita después de la creación del workspace, en lugar del dashboard completo, para guiar al usuario en sus siguientes pasos.
 * 3. Error Boundary: Para una máxima resiliencia, el componente `<DashboardClient />` podría ser envuelto en un Error Boundary de React. Esto capturaría cualquier error de renderizado inesperado en el lado del cliente y mostraría una UI de fallback amigable en lugar de una página en blanco.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Implementación Real de la Capa de Datos: Reemplazar la capa de datos simulada en `lib/data/modules.ts` por una consulta real a una tabla `feature_modules` en Supabase.
 * 2. Cacheo de Módulos: La función `getFeatureModulesForUser` es una candidata ideal para ser cacheada con `unstable_cache` de Next.js, ya que los módulos no cambian con frecuencia. La caché se podría invalidar bajo demanda cuando un administrador modifique los módulos.
 * 3. Centralizar la Lógica de Sesión en el Layout: Para optimizar aún más, la llamada a `getUser()` podría hacerse una sola vez en el `dashboard/layout.tsx` y los datos del usuario podrían pasarse a las páginas hijas a través de un Contexto de React, eliminando la necesidad de que esta página vuelva a llamar a `getUser()`.
 */
/* Ruta: app/[locale]/dashboard/page.tsx */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Esqueleto de Carga (Skeleton) Sofisticado: Reemplazar el `fallback` de Suspense, que es un simple texto, por un componente `DashboardSkeleton` visual. Este componente imitaría la estructura del dashboard (sidebar, header, y cuadrícula de tarjetas) con formas grises animadas, mejorando drásticamente la percepción de velocidad de carga.
 * 2. Página de Onboarding para Nuevos Usuarios: Añadir una comprobación después de obtener el `user`. Si es la primera visita del usuario (se puede comprobar con un campo `last_login_at` o similar en la tabla `profiles`), redirigirlo a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard principal.
 * 3. Gestión de Errores de Carga de Sesión: Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, la aplicación fallará. Capturar el error permitiría mostrar una página de error amigable en lugar de un crash de la aplicación.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton) Sofisticado:** Reemplazar el `fallback` de Suspense, que es un simple texto, por un componente `DashboardSkeleton` visual. Este componente imitaría la estructura del dashboard (sidebar, header, y cuadrícula de tarjetas) con formas grises animadas, mejorando drásticamente la percepción de velocidad de carga.
 * 2. **Página de Onboarding para Nuevos Usuarios:** Añadir una comprobación después de obtener el `user`. Si es la primera visita del usuario (se puede comprobar con un campo `last_login_at` en la tabla `profiles`), redirigirlo a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard principal.
 * 3. **Gestión de Errores de Carga de Sesión:** Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, la aplicación fallará. Capturar el error permitiría mostrar una página de error amigable en lugar de un crash de la aplicación.
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

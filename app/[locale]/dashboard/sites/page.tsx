// app/[locale]/dashboard/sites/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para "Mis Sitios". Obtiene los datos de los
 *              sitios para el workspace activo y los pasa al componente cliente.
 *              Soporta un bypass para el modo de desarrollo.
 * @author L.I.A Legacy
 * @version 4.0.0 (Data Logic Restored & DevMode-Aware)
 */
import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { sites as sitesData } from "@/lib/data";
import { mockSites } from "@/lib/dev/mock-session";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

import { SitesClient } from "./sites-client";

const SITES_PER_PAGE = 9;

export default async function SitesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  if (process.env.DEV_MODE_ENABLED === "true") {
    // En modo dev, pasamos directamente los datos simulados al cliente.
    return (
      <SitesClient
        initialSites={mockSites}
        totalCount={mockSites.length}
        page={1}
        limit={SITES_PER_PAGE}
      />
    );
  }

  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login?next=/dashboard/sites");
  }

  const workspaceId = cookieStore.get("active_workspace_id")?.value;
  if (!workspaceId) {
    logger.warn(
      `Usuario ${user.id} accedió a /sites sin un workspace activo. Redirigiendo.`
    );
    return redirect("/dashboard");
  }

  try {
    const page = Number(searchParams.page) || 1;
    const { sites, totalCount } = await sitesData.getSitesByWorkspaceId(
      workspaceId,
      {
        page,
        limit: SITES_PER_PAGE,
      }
    );

    return (
      <SitesClient
        initialSites={sites}
        totalCount={totalCount}
        page={page}
        limit={SITES_PER_PAGE}
      />
    );
  } catch (error) {
    logger.error(
      `Error al cargar los sitios para el workspace ${workspaceId}:`,
      error
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar tus Sitios
        </h2>
        <p className="text-muted-foreground mt-2">
          No pudimos obtener la información de tus sitios. Por favor, intenta
          recargar la página.
        </p>
      </Card>
    );
  }
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de servidor cuya responsabilidad es preparar los
 *  datos para la página "Mis Sitios".
 *  1.  **Autenticación y Contexto:** Primero, asegura que el usuario esté autenticado.
 *      Luego, lee la cookie `active_workspace_id` para obtener el contexto de trabajo
 *      actual. Si no hay un workspace activo, redirige al dashboard principal, que
 *      manejará el flujo de onboarding.
 *  2.  **Obtención de Datos Paginados:** Invoca a la función `getSitesByWorkspaceId`
 *      de la capa de datos (`lib/data/sites.ts`), pasándole el ID del workspace
 *      y los parámetros de paginación (`page`, `limit`) obtenidos de la URL.
 *  3.  **Manejo de Errores:** Envuelve la lógica de obtención de datos en un bloque
 *      `try/catch`. Si la función de la capa de datos lanza un error (ej. la base
 *      de datos no está disponible), se captura y se renderiza un componente de
 *      error amigable en la UI.
 *  4.  **Delegación al Cliente:** Una vez obtenidos los datos (`initialSites`, `totalCount`,
 *      etc.), los pasa como props al componente de cliente `SitesClient`, que se
 *      encargará del renderizado interactivo, la búsqueda y las acciones.
 *  Este patrón es la base de la arquitectura de Next.js App Router: los Server
 *  Components manejan el acceso a datos y la seguridad, y los Client Components
 *  manejan la interactividad.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros en el Servidor: Expandir la funcionalidad para aceptar otros `searchParams` desde la URL, como `q` (para búsqueda) o `sort` (para ordenamiento). Estos parámetros se pasarían a la función `getSitesByWorkspaceId` para que el filtrado y ordenamiento se realicen de manera eficiente directamente en la consulta de la base de datos, en lugar de en el cliente.
 * 2. Cacheo de Datos del Servidor: Envolver la llamada a `getSitesByWorkspaceId` con `unstable_cache` de Next.js. Esto mejoraría el rendimiento en navegaciones repetidas a la misma página, sirviendo los datos desde una caché en el servidor. La caché se invalidaría automáticamente cuando las Server Actions (`createSiteAction`, `deleteSiteAction`) usen `revalidatePath`.
 * 3. Esqueleto de Carga Específico: Crear un archivo `loading.tsx` en este mismo directorio. Este mostraría un esqueleto de carga visualmente similar a la cuadrícula de sitios (`SitesGrid`), mejorando la experiencia de usuario percibida (LCP y CLS) mientras se ejecutan las consultas asíncronas en este componente.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de servidor que actúa como una capa de seguridad
 *  y obtención de datos. Su flujo lógico es secuencial y robusto.
 *  1.  **Autenticación:** Primero, verifica si hay un usuario autenticado. Si no, redirige al login.
 *  2.  **Obtención de Contexto:** Obtiene los datos del 'Sitio' a partir del `siteId` de la URL para conseguir el `workspace_id` al que pertenece. Si no encuentra el sitio, devuelve un 404.
 *  3.  **Autorización Centralizada:** Invoca al helper `hasWorkspacePermission`. Esta es la verificación de seguridad más importante: confirma que el usuario actual es miembro del workspace al que pertenece el sitio. Si falla, lo redirige, previniendo cualquier acceso no autorizado a los datos.
 *  4.  **Obtención de Datos Paginados:** Una vez autorizado, llama a la función `getPaginatedCampaignsBySiteId` de la capa de datos (`lib/data/campaigns.ts`) para obtener la lista de campañas correspondiente a la página solicitada.
 *  5.  **Paso de Props a Cliente:** Finalmente, pasa todos los datos obtenidos (información del sitio, lista de campañas, datos de paginación) como props al componente de cliente `CampaignsClient`, que se encargará de la renderización y la interactividad. El `BreadcrumbsProvider` enriquece el contexto para que los componentes de UI puedan mostrar nombres legibles en lugar de UUIDs.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Cacheo de Datos del Servidor: La consulta `getPaginatedCampaignsBySiteId` es una candidata ideal para ser cacheada usando `unstable_cache` de Next.js, con etiquetas (`tags`) que incluyan el `siteId` y el `page`. Las Server Actions que crean, editan o eliminan campañas deberían entonces usar `revalidateTag` para invalidar esta caché específica, asegurando que los datos estén siempre actualizados sin sacrificar el rendimiento.
 * 2. Búsqueda y Filtros en el Servidor: Expandir la función `getPaginatedCampaignsBySiteId` para que acepte parámetros de búsqueda y ordenamiento desde los `searchParams` de la URL (ej. `?q=oferta&sort=name_asc`). La consulta de Supabase se modificaría para incluir cláusulas `.ilike()` y `.order()` dinámicas, permitiendo un filtrado y ordenamiento eficientes directamente en la base de datos.
 * 3. Componente de Error Reutilizable: En lugar de renderizar el JSX de error directamente, se podría crear un componente genérico `<DataErrorCard title="..." description="..." />` en `components/ui`. Esto permitiría reutilizar el mismo patrón de UI de error en todas las páginas de obtención de datos, manteniendo la consistencia visual y centralizando la lógica de presentación de errores.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de servidor que actúa como una capa de seguridad
 *  y obtención de datos. Su flujo lógico es secuencial y robusto.
 *  1.  **Autenticación:** Primero, verifica si hay un usuario autenticado. Si no, redirige al login.
 *  2.  **Obtención de Contexto:** Obtiene los datos del 'Sitio' a partir del `siteId` de la URL para conseguir el `workspace_id` al que pertenece. Si no encuentra el sitio, devuelve un 404.
 *  3.  **Autorización Centralizada:** Invoca al helper `hasWorkspacePermission`. Esta es la verificación de seguridad más importante: confirma que el usuario actual es miembro del workspace al que pertenece el sitio. Si falla, lo redirige, previniendo cualquier acceso no autorizado a los datos.
 *  4.  **Obtención de Datos Paginados:** Una vez autorizado, llama a la función `getPaginatedCampaignsBySiteId` de la capa de datos (`lib/data/campaigns.ts`) para obtener la lista de campañas correspondiente a la página solicitada.
 *  5.  **Paso de Props a Cliente:** Finalmente, pasa todos los datos obtenidos (información del sitio, lista de campañas, datos de paginación) como props al componente de cliente `CampaignsClient`, que se encargará de la renderización y la interactividad. El `BreadcrumbsProvider` enriquece el contexto para que los componentes de UI puedan mostrar nombres legibles en lugar de UUIDs.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Cacheo de Datos del Servidor: La consulta `getPaginatedCampaignsBySiteId` es una candidata ideal para ser cacheada usando `unstable_cache` de Next.js, con etiquetas (`tags`) que incluyan el `siteId` y el `page`. Las Server Actions que crean, editan o eliminan campañas deberían entonces usar `revalidateTag` para invalidar esta caché específica, asegurando que los datos estén siempre actualizados sin sacrificar el rendimiento.
 * 2. Búsqueda y Filtros en el Servidor: Expandir la función `getPaginatedCampaignsBySiteId` para que acepte parámetros de búsqueda y ordenamiento desde los `searchParams` de la URL (ej. `?q=oferta&sort=name_asc`). La consulta de Supabase se modificaría para incluir cláusulas `.ilike()` y `.order()` dinámicas, permitiendo un filtrado y ordenamiento eficientes directamente en la base de datos.
 * 3. Componente de Error Reutilizable: En lugar de renderizar el JSX de error directamente, se podría crear un componente genérico `<DataErrorCard title="..." description="..." />` en `components/ui`. Esto permitiría reutilizar el mismo patrón de UI de error en todas las páginas de obtención de datos, manteniendo la consistencia visual y centralizando la lógica de presentación de errores.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros en el Servidor: Expandir la funcionalidad para aceptar otros `searchParams` como `q` (búsqueda) o `sort` (orden) y pasarlos a la función `getSitesByWorkspaceId` para que el filtrado y ordenamiento se realicen eficientemente en la base de datos.
 * 2. Conteo de Campañas: Modificar la consulta en `getSitesByWorkspaceId` (o crear una nueva) para que incluya un conteo de las campañas asociadas a cada sitio, permitiendo mostrar información más rica en la UI.
 * 3. Precarga de Datos (Prefetching): Para una navegación más fluida, se podrían añadir enlaces de precarga (`<link rel="prefetch">`) para las páginas siguientes y anteriores en el componente de paginación.
 */

// app/[locale]/dashboard/sites/sites-client.tsx
"use client";

import { PaginationControls, SitesGrid, SitesHeader } from "@/components/sites";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

/**
 * @file sites-client.tsx
 * @description Componente orquestador de cliente para la página de "Mis Sitios".
 *              Recibe los datos iniciales del servidor como props.
 * @author L.I.A Legacy
 * @version 8.0.0 (Props-Driven Restored)
 */
interface SitesClientProps {
  initialSites: SiteWithCampaignsCount[];
  totalCount: number;
  page: number;
  limit: number;
}

export function SitesClient({
  initialSites,
  totalCount,
  page,
  limit,
}: SitesClientProps) {
  const {
    filteredSites,
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    handleCreate,
    isPending,
    isCreating,
    deletingSiteId,
  } = useSitesManagement(initialSites);

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmitCreate={handleCreate}
        isCreating={isCreating}
      />
      <SitesGrid
        sites={filteredSites}
        onDelete={handleDelete}
        isPending={isPending}
        deletingSiteId={deletingSiteId}
      />
      {!searchQuery && (
        <PaginationControls
          page={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/dashboard/sites"
        />
      )}
    </div>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha sido refactorizado a un "Componente de Presentación Orquestado".
 *  Toda su lógica de estado compleja y sus manejadores de eventos han sido
 *  abstraídos en el hook personalizado `useSitesManagement`.
 *  1.  **Inicialización:** Al montarse, invoca `useSitesManagement` con los datos
 *      iniciales del servidor (`initialSites`).
 *  2.  **Orquestación de Props:** Actúa como un conducto, pasando el estado y los
 *      manejadores devueltos por el hook a sus componentes hijos (`SitesHeader`, `SitesGrid`).
 *      Por ejemplo, `searchQuery` y `setSearchQuery` se pasan a `SitesHeader`.
 *  3.  **Manejo de Creación:** El `CreateSiteForm` (dentro del `SitesHeader`) ahora
 *      recibe la función `handleCreate` del hook. Esto permite que el hook
 *      gestione la actualización optimista de la UI antes de que la Server Action
 *      se complete, creando una experiencia de usuario instantánea y consistente.
 *  Este patrón desacopla la lógica (el hook) de la vista (el componente), haciendo
 *  el código más legible, reutilizable y fácil de probar.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda en el Servidor para Escalabilidad: Para escalar a miles de sitios, el filtrado debe realizarse en la base de datos. Esto implicaría modificar el hook `useSitesManagement` para que, cuando cambie `searchQuery`, se llame a una nueva Server Action `searchSitesAction(query)` en lugar de filtrar en el cliente.
 * 2. AbortController para Búsqueda en Servidor: En una implementación de búsqueda en servidor, se debería usar un `AbortController` dentro del hook para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo, optimizando el uso de recursos de red y servidor.
 * 3. Virtualización de la Cuadrícula: Para usuarios con cientos de sitios, el rendimiento puede degradarse. Integrar una librería como `TanStack Virtual` en el componente `SitesGrid` para renderizar solo las tarjetas visibles en la pantalla es la solución definitiva para una performance óptima a gran escala.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda en el Servidor: Para escalar a miles de sitios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `sites/page.tsx` para usar `ilike()`.
 * 2. AbortController para Búsqueda en Servidor: En una implementación de búsqueda en servidor, se debería usar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo, optimizando el uso de recursos de red y servidor.
 * 3. Actualización Optimista para Creación: De forma similar a la eliminación, la creación de un nuevo sitio podría actualizar la UI localmente de forma instantánea antes de que el servidor confirme la operación, mejorando la percepción de velocidad.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Sincronización Post-Creación: Actualmente, tras crear un sitio, la UI no se actualiza hasta un refresh manual. La `onSuccess` callback del formulario de creación debería desencadenar una llamada a `router.refresh()` en este componente para mostrar el nuevo sitio. (IMPLEMENTADO)
 * 2. Búsqueda en el Servidor: Para escalar a miles de sitios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `sites/page.tsx`.
 * 3. AbortController para Búsqueda: En una implementación de búsqueda en servidor, se debería usar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo, optimizando el uso de recursos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Debouncing para la Búsqueda: Implementar un "debounce" en el input de búsqueda para evitar recalcular la lista filtrada en cada pulsación de tecla, mejorando el rendimiento con listas grandes.
 * 2. Sincronización Post-Creación: Actualmente, tras crear un sitio, la UI no se actualiza hasta un refresh manual. La `onSuccess` callback del formulario de creación debería desencadenar una llamada a `router.refresh()` en este componente para mostrar el nuevo sitio.
 * 3. Búsqueda en el Servidor: Para escalar a miles de sitios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `sites/page.tsx`.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Actualización Optimista: Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio solo si la acción del servidor falla.
 * 2. Búsqueda y Filtros en Cliente: Para mejorar la UX en esta página, se podría añadir un input de búsqueda que filtre la lista `initialSites` en el cliente, complementando la paginación del servidor.
 * 3. Previsualización de Sitio en Hover: Al pasar el cursor sobre una tarjeta, se podría mostrar una pequeña captura de pantalla de la página principal del sitio en un componente `<Tooltip>` o `<Popover>` para una identificación visual más rápida.
 */
/* 1. Actualización Optimista: Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio solo si la acción del servidor falla.
 * 2. Búsqueda y Filtros en Cliente: Para mejorar la UX en esta página, se podría añadir un input de búsqueda que filtre la lista `initialSites` en el cliente, complementando la paginación del servidor.
 * 3. Previsualización de Sitio en Hover: Al pasar el cursor sobre una tarjeta, se podría mostrar una pequeña captura de pantalla de la página principal del sitio en un componente `<Tooltip>` o `<Popover>` para una identificación visual más rápida.
 MEJORAS FUTURAS DETECTADAS
 * 1. Lógica de Eliminación Completa: Implementar la Server Action `deleteSiteAction` y conectarla al botón de eliminar a través de un modal de confirmación (`DeleteSiteDialog`), similar al del Admin Dashboard.
 * 2. Conteo Real de Campañas: Reemplazar el "0 Campañas" estático con una consulta real en el Server Component (`sites/page.tsx`) que haga un `count` de las campañas asociadas a cada sitio.
 * 3. Actualización Optimista: Al crear un nuevo sitio, añadirlo inmediatamente al estado de la UI antes de que la acción del servidor se complete, proporcionando una experiencia de usuario más rápida y fluida.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Conteo Real de Campañas: Reemplazar el "0 Campañas" estático con una consulta real en el Server Component (`sites/page.tsx`) que haga un `count` de las campañas asociadas a cada sitio y pase ese dato a este componente.
 * 2. Actualización Optimista: Al crear un nuevo sitio, añadirlo inmediatamente al estado de la UI (usando un estado de React local) antes de que la acción del servidor se complete. Si la acción falla, se puede eliminar y mostrar un toast. Esto proporciona una experiencia de usuario más rápida y fluida.
 * 3. Búsqueda y Filtros en Cliente: Para mejorar la UX en la página actual, se podría añadir un input de búsqueda que filtre la lista `initialSites` en el cliente, complementando la paginación del servidor.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Lógica de Eliminación Completa: Implementar la Server Action `deleteSiteAction` y conectarla al botón de eliminar a través de un modal de confirmación (`DeleteSiteDialog`), similar al del Admin Dashboard.
 * 2. Conteo Real de Campañas: Reemplazar el "0 Campañas" estático con una consulta real en el Server Component (`sites/page.tsx`) que haga un `count` de las campañas asociadas a cada sitio.
 * 3. Actualización Optimista: Al crear un nuevo sitio, añadirlo inmediatamente al estado de la UI antes de que la acción del servidor se complete, proporcionando una experiencia de usuario más rápida y fluida.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Lógica de Eliminación Completa: Implementar la Server Action `deleteSiteAction` y conectarla al botón de eliminar a través de un modal de confirmación (`DeleteSiteDialog`), similar al del Admin Dashboard.
 * 2. Conteo Real de Campañas: Reemplazar el "0 Campañas" estático con una consulta real en el Server Component (`sites/page.tsx`) que haga un `count` de las campañas asociadas a cada sitio.
 * 3. Actualización Optimista: Al crear un nuevo sitio, añadirlo inmediatamente al estado de la UI antes de que la acción del servidor se complete, proporcionando una experiencia de usuario más rápida y fluida.
 */

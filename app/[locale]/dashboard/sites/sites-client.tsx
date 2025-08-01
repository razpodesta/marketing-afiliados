// app/[locale]/dashboard/sites/sites-client.tsx
/**
 * @file sites-client.tsx
 * @description Aparato Orquestador del Cliente para la página "Mis Sitios".
 *              Este componente es la capa de cliente que ensambla la UI,
 *              gestionando la comunicación entre el encabezado de búsqueda, la
 *              cuadrícula de sitios y los controles de paginación. Delega toda la
 *              lógica de estado y las interacciones al hook especializado
 *              `useSitesManagement`.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 10.0.0 (Server-Side Search Architecture)
 *
 * @functionality
 * - Consume el `DashboardContext` para obtener el workspace activo.
 * - Utiliza el hook `useSitesManagement` para gestionar el estado de la UI (lista de sitios,
 *   estado de diálogos, callbacks de acciones).
 * - Renderiza los componentes de presentación (`SitesHeader`, `SitesGrid`, `PaginationControls`).
 * - Actúa como un "cableador", pasando las props (como `searchQuery`) y los manejadores
 *   de eventos (`onSearchChange`, `handleDelete`) desde el hook a los componentes hijos.
 *
 * @relationships
 * - Es el componente de cliente principal renderizado por `app/[locale]/dashboard/sites/page.tsx`.
 * - Es el consumidor primario del hook `lib/hooks/useSitesManagement.ts`.
 * - Es el componente padre de `SitesHeader`, `SitesGrid` y `PaginationControls`.
 *
 * @expectations
 * - Se espera que este componente sea una capa de orquestación "delgada", sin lógica de
 *   negocio propia. Su responsabilidad es ensamblar la UI y conectar el estado del hook
 *   con los componentes de presentación.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la UI de gestión de sitios.
 *
 * 1.  **Mensaje de Bienvenida/Onboarding para 0 Sitios**: (Vigente) Cuando `sites.length === 0` y no hay `searchQuery`, el mensaje "No se encontraron sitios" podría ser un componente de "estado vacío" más amigable que invite al usuario a crear su primer sitio con un CTA destacado, mejorando el flujo de onboarding.
 * 2.  **Transiciones de Página Suaves**: (Vigente) Al navegar entre páginas o al realizar una búsqueda, se podría usar `framer-motion` para añadir una transición de fundido (fade) a `SitesGrid`, mejorando la percepción de fluidez en la UI.
 * 3.  **Sincronización de URL sin Historial**: (Vigente) El hook `useSitesManagement` podría ser mejorado para usar `router.replace` en lugar de `router.push` al buscar. Esto actualizaría la URL sin añadir cada búsqueda al historial del navegador, permitiendo que el botón "Atrás" funcione de manera más intuitiva para el usuario.
 */
"use client";

import { PaginationControls, SitesGrid, SitesHeader } from "@/components/sites";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

interface SitesClientProps {
  initialSites: SiteWithCampaignsCount[];
  totalCount: number;
  page: number;
  limit: number;
  searchQuery: string;
}

export function SitesClient({
  initialSites,
  totalCount,
  page,
  limit,
  searchQuery,
}: SitesClientProps) {
  const { activeWorkspace } = useDashboard();
  const {
    sites,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    deletingSiteId,
    handleSearch,
  } = useSitesManagement(initialSites);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        workspaceId={activeWorkspace.id}
      />
      <SitesGrid
        sites={sites}
        onDelete={handleDelete}
        isPending={isPending}
        deletingSiteId={deletingSiteId}
      />
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath="/dashboard/sites"
        searchQuery={searchQuery}
      />
    </div>
  );
}
// app/[locale]/dashboard/sites/sites-client.tsx

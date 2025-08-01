// Ruta: app/[locale]/dashboard/sites/sites-client.tsx
/**
 * @file sites-client.tsx
 * @description Componente orquestador de cliente para la página de "Mis Sitios".
 *              Ha sido refactorizado para alinearse con la nueva API simplificada
 *              del hook `useSitesManagement`. Su función es coordinar la UI,
 *              delegando la lógica de estado a un custom hook y la presentación
 *              a componentes puros, recibiendo datos iniciales del servidor.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 9.1.0 (Optimal Orchestrator)
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
}

export function SitesClient({
  initialSites,
  totalCount,
  page,
  limit,
}: SitesClientProps) {
  const { activeWorkspace } = useDashboard();

  const {
    filteredSites,
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    deletingSiteId,
  } = useSitesManagement(initialSites);

  // Si no hay un workspace activo, no hay nada que mostrar en el dashboard de sitios.
  // Podría ser un escenario de onboarding incompleto o un error de sesión.
  if (!activeWorkspace) {
    // A futuro, se podría renderizar un componente de fallback más amigable aquí,
    // o un ErrorBoundary que redirija al usuario al flujo de onboarding si es necesario.
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        workspaceId={activeWorkspace.id}
      />
      <SitesGrid
        sites={filteredSites}
        onDelete={handleDelete}
        isPending={isPending}
        deletingSiteId={deletingSiteId}
      />
      {!searchQuery && ( // Solo muestra la paginación si no hay una búsqueda activa
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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `SitesClient` es el orquestador principal de la página "Mis Sitios".
 *                Es un componente de cliente que conecta la capa de datos (recibida como props)
 *                con la lógica de estado interactiva (manejada por `useSitesManagement`) y la
 *                presentación visual (componentes puros como `SitesHeader` y `SitesGrid`).
 *
 * @functionality
 * - **Orquestación de Estado y UI:** Recibe los datos iniciales de los sitios y la paginación del Server Component padre.
 *   Delega la gestión de estado dinámico (filtrado, eliminación, apertura de diálogos) al hook `useSitesManagement`.
 *   Pasa el estado derivado y los manejadores a los componentes de presentación puros.
 * - **Sincronización de Contexto:** Utiliza `useDashboard` para obtener información del workspace activo,
 *   lo cual es esencial para contextualizar las operaciones (ej. `workspaceId` para `CreateSiteForm`).
 * - **Renderizado Condicional:** Oculta los controles de paginación cuando hay una búsqueda activa, lo que mejora la UX.
 *
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/dashboard/sites/page.tsx` (Server Component), del cual recibe los datos iniciales.
 * - Consume el contexto `DashboardContext` a través del hook `useDashboard`.
 * - Es el consumidor principal del hook `useSitesManagement` (`lib/hooks/useSitesManagement.ts`).
 * - Es el padre de `SitesHeader.tsx`, `SitesGrid.tsx` y `PaginationControls.tsx`, actuando como su controlador de datos.
 *
 * @expectations
 * - Se espera que este componente sea una capa de orquestación delgada, eficiente y sin estado propio complejo.
 *   Su código debe ser conciso, legible y centrado en conectar la lógica del cliente con la UI,
 *   garantizando que la experiencia de usuario para la gestión de sitios sea fluida y reactiva.
 *   No debe contener lógica de negocio ni realizar llamadas directas a la base de datos o Server Actions,
 *   delegando esas responsabilidades a sus respectivos aparatos.
 * =================================================================================================
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Manejo de Estado Vacío para Resultados de Búsqueda:** Cuando `filteredSites` está vacío debido a una `searchQuery`, `SitesGrid` muestra "No se encontraron sitios". Se podría mejorar `SitesHeader` para mostrar un título contextualizado como "No se encontraron resultados para '{searchQuery}'", brindando un feedback más preciso al usuario. Esto requeriría una prop adicional en `SitesHeader` que indique si el vacío es por búsqueda.
 * 2.  **Esqueleto de Carga en `SitesGrid` (para primera carga o "no sites"):** Si `initialSites` es una matriz vacía y no hay `searchQuery` (indicando que el usuario no ha creado sitios aún), o si la carga inicial desde el servidor es muy lenta, se podría mostrar un esqueleto visualmente atractivo (`Card`s en estado de carga) en `SitesGrid` en lugar del mensaje de "No se encontraron sitios". Esto mejoraría la percepción de velocidad.
 * 3.  **Mensaje de Bienvenida/Onboarding para 0 Sitios:** Cuando `sites.length === 0` y `!searchQuery` (es decir, el usuario no tiene sitios y no está buscando), el mensaje actual "No se encontraron sitios" podría ser un componente de "estado vacío" más amigable que invite al usuario a crear su primer sitio con un CTA destacado, mejorando el flujo de onboarding.
 */

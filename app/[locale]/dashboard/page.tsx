// app/[locale]/dashboard/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada del servidor para el dashboard principal.
 *              Este aparato ha sido refactorizado para delegar completamente la
 *              obtención de datos a la capa de datos canónica, adhiriéndose a
 *              una arquitectura limpia y de alta cohesión.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 2.0.0 (Data Layer Abstraction)
 */
import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { campaigns as campaignsData } from "@/lib/data";
import { logger } from "@/lib/logging";

import { DashboardClient } from "./dashboard-client";

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

async function DashboardPageLoader() {
  if (process.env.DEV_MODE_ENABLED === "true") {
    logger.trace(
      "[DASHBOARD_PAGE] Modo DEV: Devolviendo datos de campañas simuladas."
    );
    // En modo DEV, el dashboard no necesita campañas recientes.
    return <DashboardClient recentCampaigns={[]} />;
  }

  const cookieStore = cookies();
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  if (!activeWorkspaceId) {
    logger.warn(
      "[DASHBOARD_PAGE] No hay workspace activo. No se pueden cargar campañas recientes."
    );
    return <DashboardClient recentCampaigns={[]} />;
  }

  try {
    // REFACTORIZACIÓN: La lógica de consulta a Supabase ha sido reemplazada
    // por una llamada única y limpia a la capa de datos.
    const recentCampaigns =
      await campaignsData.getRecentCampaignsByWorkspaceId(activeWorkspaceId);

    return <DashboardClient recentCampaigns={recentCampaigns} />;
  } catch (error) {
    logger.error(
      "[DASHBOARD_PAGE] Error al cargar campañas recientes desde la capa de datos:",
      error
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar Datos
        </h2>
        <p className="text-muted-foreground mt-2">
          No se pudo obtener la información de tus campañas recientes.
        </p>
      </Card>
    );
  }
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPageLoader />
    </Suspense>
  );
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la página principal del dashboard.
 *
 * 1.  **Cacheo de Datos con `unstable_cache`**: La llamada a `getRecentCampaignsByWorkspaceId` es una candidata ideal para ser envuelta con `unstable_cache` de Next.js. Esto podría cachear el resultado por un corto período (ej. 1-5 minutos), mejorando el rendimiento en navegaciones frecuentes al dashboard sin sacrificar la frescura de los datos.
 * 2.  **Esqueleto de Carga Sofisticado**: El componente `PageSkeleton` actual es funcional. Podría ser reemplazado por un esqueleto más detallado que imite con mayor precisión la estructura de `DashboardClient` (título, cuadrícula de tarjetas), mejorando la experiencia de carga percibida (LCP y CLS).
 * 3.  **Estado de Bienvenida Contextual**: Aunque el layout redirige en el onboarding, esta página podría mostrar un componente especial de "Bienvenida" en la primera visita después de la creación del workspace, en lugar del dashboard completo, para guiar al usuario en sus siguientes pasos de forma más efectiva.
 * 4.  **Error Boundary de React**: Para una máxima resiliencia, el componente `<DashboardClient />` dentro de `DashboardPageLoader` podría ser envuelto en un Error Boundary de React. Esto capturaría cualquier error de renderizado inesperado en el lado del cliente y mostraría una UI de fallback amigable en lugar de una página en blanco.
 */
// app/[locale]/dashboard/page.tsx

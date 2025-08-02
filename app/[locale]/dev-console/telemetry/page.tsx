// app/[locale]/dev-console/telemetry/page.tsx
/**
 * @file page.tsx
 * @description Página del Visor de Telemetría para el `dev-console`.
 *              Carga los logs de visitantes de forma paginada para supervisión.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

import { VisitorLogsTable } from "../components/VisitorLogsTable";

const LOGS_PER_PAGE = 25;

/**
 * @async
 * @function TelemetryPage
 * @description Componente de servidor que obtiene y muestra los logs de visitantes.
 * @param {object} props - Propiedades pasadas por Next.js.
 * @param {object} props.searchParams - Parámetros de la URL.
 * @returns {Promise<JSX.Element>} La página de telemetría renderizada.
 */
export default async function TelemetryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * LOGS_PER_PAGE;
  const to = from + LOGS_PER_PAGE - 1;

  const {
    data: logs,
    error,
    count,
  } = await supabase
    .from("visitor_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      "[TelemetryPage] Error al cargar los logs de visitantes:",
      error
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar los Logs
        </h2>
        <p className="text-muted-foreground mt-2">
          No pudimos obtener la información de telemetría. Por favor, intenta
          recargar la página.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Visor de Telemetría de Visitantes
        </h1>
        <p className="text-muted-foreground">
          Supervisa la actividad de los visitantes en la plataforma.
        </p>
      </div>
      <VisitorLogsTable logs={logs} />
      {/* TODO: Integrar aquí el componente PaginationControls */}
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la página de telemetría.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Integración de `PaginationControls`**: (Vigente) Implementar el componente `PaginationControls` para permitir la navegación entre las páginas de resultados.
 * 2. **Abstracción a Capa de Datos**: (Vigente) Mover la lógica de consulta de Supabase a una nueva función `getVisitorLogs` en un nuevo archivo `lib/data/telemetry.ts` para una mejor separación de responsabilidades.
 * 3. **Búsqueda y Filtros en Servidor**: (Vigente) Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=192.168.1.1`) que se pasarían a la función de la capa de datos para filtrar los resultados directamente en la base de datos.
 */
// app/[locale]/dev-console/telemetry/page.tsx

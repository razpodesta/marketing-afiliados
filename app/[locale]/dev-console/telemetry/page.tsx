// app/[locale]/dev-console/telemetry/page.tsx
/**
 * @file page.tsx
 * @description Página del Visor de Telemetría. Refactorizada para transformar
 *              os dados do Supabase, garantindo a segurança de tipos ao passar
 *              props para o componente cliente.
 * @author L.I.A Legacy
 * @version 2.1.0 (Type-Safe Data Transformation)
 */
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

import {
  VisitorLogsTable,
  type VisitorLogRow,
} from "../components/VisitorLogsTable";

const LOGS_PER_PAGE = 25;

export default async function TelemetryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const t = await getTranslations("DevConsole.TelemetryTable");
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * LOGS_PER_PAGE;
  const to = from + LOGS_PER_PAGE - 1;

  try {
    const {
      data: rawLogs,
      error,
      count,
    } = await supabase
      .from("visitor_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // --- INÍCIO DA CORREÇÃO DE TIPO ---
    // Transforma os dados brutos para cumprir o contrato de `VisitorLogRow`.
    const logs: VisitorLogRow[] = (rawLogs || []).map((log) => ({
      ...log,
      ip_address: String(log.ip_address || "N/A"), // Conversão segura para string
    }));
    // --- FIM DA CORREÇÃO DE TIPO ---

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <VisitorLogsTable logs={logs} />
        {/* TODO: Integrar aquí el componente PaginationControls */}
      </div>
    );
  } catch (error) {
    logger.error(
      "[DevConsole:TelemetryPage] Error al cargar los logs de visitantes:",
      error instanceof Error ? error.message : String(error)
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          {t("error_title")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("error_description")}</p>
      </Card>
    );
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Transformação Segura de Tipos**: ((Implementada)) O componente agora mapeia os dados brutos do Supabase e converte `ip_address` de `unknown` para `string`, resolvendo o erro de compilação TS2322 e garantindo a segurança de tipos.
 *
 * @subsection Melhorias Futuras
 * 1. **Abstracción a Capa de Datos**: ((Vigente)) Mover a lógica de consulta de Supabase a uma nova função `getVisitorLogs` em `lib/data/admin.ts`.
 */
// app/[locale]/dev-console/telemetry/page.tsx

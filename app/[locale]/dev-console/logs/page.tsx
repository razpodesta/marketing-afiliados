/* Ruta: app/[locale]/dev-console/logs/page.tsx */

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @file page.tsx
 * @description Página de Logs de Auditoría para el `dev-console`.
 * Esta página mostrará un registro de todas las acciones críticas realizadas
 * en la plataforma. (Funcionalidad Futura).
 *
 * @author Metashark
 * @version 1.0.0
 */
export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs de Auditoría</h1>
        <p className="text-muted-foreground">
          Rastrea las acciones importantes realizadas en la plataforma.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>En Desarrollo</CardTitle>
          <CardDescription>
            La funcionalidad para visualizar los logs de auditoría se
            implementará en una futura etapa.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
/* Ruta: app/[locale]/dev-console/logs/page.tsx */

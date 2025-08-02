// app/[locale]/dev-console/components/VisitorLogsTable.tsx
/**
 * @file VisitorLogsTable.tsx
 * @description Componente de cliente para mostrar, buscar y filtrar los
 *              registros de telemetría de los visitantes. Proporciona una
 *              interfaz clara para que los desarrolladores supervisen la
 *              actividad de los visitantes.
 * @author L.I.A Legacy
 * @version 1.0.0
 * @see {@link file://./VisitorLogsTable.test.tsx} Para el arnés de pruebas correspondiente.
 */
"use client";

import { Eye, Globe, MoreHorizontal, User } from "lucide-react";
import { useFormatter } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Json } from "@/lib/types/database";

// Contrato de tipo para los datos que este componente espera recibir.
export type VisitorLogRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  fingerprint: string;
  ip_address: string;
  geo_data: Json | null;
  utm_params: Json | null;
  created_at: string;
};

const JsonViewerDialog = ({
  title,
  data,
  trigger,
}: {
  title: string;
  data: Json | null;
  trigger: React.ReactNode;
}) => (
  <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <pre className="mt-2 w-full rounded-lg bg-muted p-4 text-xs overflow-auto max-h-[60vh]">
        {JSON.stringify(data, null, 2) || "No data available."}
      </pre>
    </DialogContent>
  </Dialog>
);

export function VisitorLogsTable({ logs }: { logs: VisitorLogRow[] }) {
  const format = useFormatter();

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User / Session</TableHead>
            <TableHead>IP / Country</TableHead>
            <TableHead>Fingerprint</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format.dateTime(new Date(log.created_at), "medium")}
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">
                    {log.user_id ? (
                      <>
                        <User className="h-4 w-4 text-primary" />
                        <span title={log.user_id}>Usuario Registrado</span>
                      </>
                    ) : (
                      <span title={log.session_id}>Sesión Anónima</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{log.ip_address}</span>
                    {log.geo_data && (log.geo_data as any).country && (
                      <span
                        className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded"
                        title={JSON.stringify(log.geo_data)}
                      >
                        {(log.geo_data as any).country}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs truncate max-w-xs">
                  {log.fingerprint}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <JsonViewerDialog
                        title="Geo Data"
                        data={log.geo_data}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Globe className="mr-2 h-4 w-4" /> Ver Geo Data
                          </DropdownMenuItem>
                        }
                      />
                      <JsonViewerDialog
                        title="UTM Parameters"
                        data={log.utm_params}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Ver UTMs
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No se han registrado visitas todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la tabla de telemetría.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Paginación y Búsqueda en Servidor**: (Vigente) La tabla actual carga todos los logs. Para escalar, la página contenedora debe implementar paginación y pasar un parámetro de búsqueda (por IP, user_id) a la capa de datos.
 * 2. **Formateador de JSON con Resaltado**: (Vigente) En lugar de un `<pre>` simple, utilizar `react-syntax-highlighter` en el `JsonViewerDialog` para una legibilidad superior de los datos JSON.
 * 3. **Acciones Contextuales**: (Vigente) Añadir acciones en el menú, como "Ver perfil de usuario" (si `user_id` existe) o "Ver todas las sesiones con esta Fingerprint", que naveguen a vistas filtradas de la misma tabla.
 */
// app/[locale]/dev-console/components/VisitorLogsTable.tsx

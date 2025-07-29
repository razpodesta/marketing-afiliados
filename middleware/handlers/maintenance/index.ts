// middleware/handlers/maintenance/index.ts
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";

/**
 * @file middleware/handlers/maintenance/index.ts
 * @description Manejador de middleware para el modo de mantenimiento.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export function handleMaintenance(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isBypassed = request.cookies.has("maintenance_bypass");
  const isMaintenancePage = pathname.startsWith("/maintenance.html");

  if (isMaintenanceMode && !isBypassed && !isMaintenancePage) {
    logger.warn(
      { path: pathname },
      "[MAINTENANCE_HANDLER] Petición bloqueada por modo mantenimiento."
    );
    return NextResponse.rewrite(new URL("/maintenance.html", request.url));
  }

  return null;
}

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Firewall de IPs para Mantenimiento: En lugar de una cookie, se podría usar una lista blanca de IPs (definida en variables de entorno) para el bypass. Esto es más seguro para que los desarrolladores accedan durante el mantenimiento.
 * 2. Integración con Feature Flags: Para una gestión avanzada, el flag `MAINTENANCE_MODE` podría ser gestionado por un servicio como LaunchDarkly, permitiendo activarlo y desactivarlo sin un redespliegue.
 */

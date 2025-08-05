// middleware/handlers/maintenance/index.ts
/**
 * @file middleware/handlers/maintenance/index.ts
 * @description Manejador de middleware para el modo de mantenimiento.
 *              Ha sido refactorizado para recibir el logger vía inyección de
 *              dependencias, desacoplándolo completamente del módulo de logging.
 * @author L.I.A Legacy
 * @version 4.0.0 (Dependency Injection)
 */
import { type NextRequest, NextResponse } from "next/server";

/**
 * @typedef Logger
 * @description Define el contrato mínimo que un logger debe cumplir para ser
 *              utilizado por este manejador.
 */
type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
};

/**
 * @function handleMaintenance
 * @description Verifica si el modo de mantenimiento está activo. Si es así,
 *              reescribe la petición a la página de mantenimiento, a menos que
 *              el usuario tenga una cookie de bypass.
 * @param {NextRequest} request - El objeto de la petición entrante.
 * @param {Logger} logger - La instancia del logger inyectada.
 * @returns {NextResponse | null} Una respuesta de reescritura si es necesario, o null para continuar.
 */
export function handleMaintenance(
  request: NextRequest,
  logger: Logger
): NextResponse | null {
  logger.trace("[MAINTENANCE_HANDLER] Auditing for maintenance mode.");
  const { pathname } = request.nextUrl;

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isBypassed = request.cookies.has("maintenance_bypass");
  const isMaintenancePage = pathname === "/maintenance.html";

  if (isMaintenanceMode && !isBypassed && !isMaintenancePage) {
    logger.warn(
      "[MAINTENANCE_HANDLER] DECISION: Blocking request. Maintenance mode active.",
      { path: pathname }
    );
    return NextResponse.rewrite(new URL("/maintenance.html", request.url));
  }

  if (isMaintenanceMode && isBypassed) {
    logger.info(
      "[MAINTENANCE_HANDLER] DECISION: Bypassing maintenance mode. Cookie detected.",
      { path: pathname }
    );
  } else {
    logger.trace(
      "[MAINTENANCE_HANDLER] DECISION: Maintenance mode inactive or condition not met. Passing to next handler."
    );
  }

  return null;
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Inyección de Dependencias**: ((Implementada)) El manejador ahora recibe el logger como un parámetro, eliminando la importación directa y mejorando el desacoplamiento y la testabilidad.
 *
 * @subsection Melhorias Futuras
 * 1. **Firewall de IPs para Mantenimiento**: ((Vigente)) Usar una lista blanca de IPs para el bypass en lugar de una cookie.
 * 2. **Integración con Feature Flags**: ((Vigente)) Gestionar el `MAINTENANCE_MODE` desde un servicio externo para activarlo sin un redespliegue.
 */
// middleware/handlers/maintenance/index.ts

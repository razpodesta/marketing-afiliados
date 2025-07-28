// Ruta: middleware/handlers/maintenance.handler.ts
/**
 * @file maintenance.handler.ts
 * @description Manejador de middleware para el modo de mantenimiento.
 * Es el primer manejador en la cadena. Si el modo de mantenimiento está
 * activo, reescribe la petición a la página de mantenimiento y detiene
 * el procesamiento posterior.
 *
 * @author Metashark
 * @version 1.0.0
 */
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description Gestiona la lógica del modo de mantenimiento.
 * @param {NextRequest} request - La petición entrante.
 * @returns {NextResponse | null} Una respuesta de reescritura si está en mantenimiento, o null para continuar.
 */
export function handleMaintenance(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isBypassed = request.cookies.has("maintenance_bypass");
  const isMaintenancePage = pathname.startsWith("/maintenance.html");

  if (isMaintenanceMode && !isBypassed && !isMaintenancePage) {
    return NextResponse.rewrite(new URL("/maintenance.html", request.url));
  }

  return null;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Firewall de IPs para Mantenimiento: En lugar de una cookie, se podría usar una lista blanca de IPs definida en variables de entorno para el bypass. Esto es más seguro para que los desarrolladores accedan durante el mantenimiento.
 * 2. Página de Mantenimiento Dinámica: La página `maintenance.html` es estática. Podría convertirse en una ruta de Next.js (`/maintenance`) para poder incluir componentes de React y un diseño más dinámico.
 * 3. Integración con LaunchDarkly: Para una gestión avanzada, el flag `MAINTENANCE_MODE` podría ser gestionado por un servicio de feature flags como LaunchDarkly, permitiendo activarlo y desactivarlo sin un redespliegue.
 */

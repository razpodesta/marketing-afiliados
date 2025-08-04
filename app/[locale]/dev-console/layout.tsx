// app/[locale]/dev-console/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal para el Dashboard de Desarrollador. Ha sido alineado
 *              con el nuevo contrato de tipos del guardián de seguridad `requireAppRole`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Type Contract Alignment)
 */
"use server";

import { redirect } from "next/navigation";
import React from "react";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { DevSidebarClient } from "./components/DevSidebarClient";

export default async function DevConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roleCheck = await requireAppRole(["developer"]);

  if (!roleCheck.success) {
    switch (roleCheck.error) {
      case "SESSION_NOT_FOUND":
        logger.warn(
          `[DevConsoleLayout] Acceso denegado: Sesión no encontrada. Redirigiendo a /login.`
        );
        return redirect("/login?next=/dev-console");
      case "PERMISSION_DENIED":
        logger.warn(
          `[DevConsoleLayout] Acceso denegado: Permisos insuficientes. Redirigiendo a /dashboard.`
        );
        return redirect("/dashboard");
      default:
        logger.error(
          `[DevConsoleLayout] Error de autorización no manejado: ${roleCheck.error}`
        );
        return redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DevSidebarClient />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Página de Acceso Denegado Específica**: ((Vigente)) Redirigir a una página `/unauthorized` en caso de `PERMISSION_DENIED` para una mejor UX.
 *
 * @subsection Mejoras Implementadas
 * 1. **Alineación de Contrato de Tipos**: ((Implementada)) La llamada a `requireAppRole` ahora se adhiere al contrato de tipos actualizado, resolviendo el error de compilación.
 */
// app/[locale]/dev-console/layout.tsx

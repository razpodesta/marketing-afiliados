// app/[locale]/dev-console/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal para el Dashboard de Desarrollador (`/dev-console`).
 *              Este componente Server protege las rutas hijas, garantizando que
 *              solo usuarios con el rol 'developer' tengan acceso. Ha sido refactorizado
 *              para manejar de forma granular los errores de autenticación y autorización.
 * @author Metashark (Refactorizado por L.I.A Legacy & RaZ Podestá)
 * @version 3.2.0 (Granular Auth Error Handling)
 */
"use server";

import { redirect } from "next/navigation";
import React from "react";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { DevSidebarClient } from "./components/DevSidebarClient";

/**
 * @async
 * @function DevConsoleLayout
 * @description Componente de Layout para la Consola de Desarrollador.
 *              Verifica el rol del usuario y redirige de forma contextual si no se cumplen los requisitos.
 * @param {object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos a ser renderizados dentro del layout.
 * @returns {Promise<JSX.Element>} El layout con los componentes hijos o una redirección.
 */
export default async function DevConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roleCheck = await requireAppRole(["developer"]);

  if (!roleCheck.success) {
    // REFACTORIZACIÓN CRÍTICA: Se manejan los tipos de error específicos.
    switch (roleCheck.error) {
      case "SESSION_NOT_FOUND":
        logger.warn(
          `[DevConsoleLayout] Acceso denegado: Sesión no encontrada. Redirigiendo a /login.`
        );
        // Redirige al login preservando la URL de destino para una mejor UX post-login.
        return redirect("/login?next=/dev-console");

      case "PERMISSION_DENIED":
        logger.warn(
          `[DevConsoleLayout] Acceso denegado: Permisos insuficientes. Redirigiendo a /dashboard.`
        );
        // El usuario está logueado pero no tiene permisos, lo mandamos a su dashboard.
        return redirect("/dashboard");

      default:
        // Fallback genérico por si se añaden nuevos tipos de error.
        logger.error(
          `[DevConsoleLayout] Error de autorización no manejado: ${roleCheck.error}`
        );
        return redirect("/dashboard");
    }
  }

  // Si la verificación es exitosa, se renderiza el layout y sus hijos.
  return (
    <div className="flex min-h-screen bg-muted/40">
      <DevSidebarClient />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar la robustez y rendimiento del layout.
 *
 * 1.  **Componente de Perfil de Desenvolvedor:** (Vigente) No `DevSidebarClient`, substituir o botão de "Cerrar Sesión" por um menu suspenso que exiba o nome e role do desenvolvedor.
 * 2.  **Carga de Datos Globais do Layout:** (Vigente) Este layout pode pré-carregar dados necessários em todas as páginas da console (e.g., estatísticas globais) e torná-los disponíveis através de um Contexto React.
 * 3.  **Notificações do Sistema:** (Vigente) Integrar um pequeno sistema de notificações na barra lateral para alertar os desenvolvedores sobre eventos críticos da plataforma.
 * 4.  **Página de Acceso Denegado Específica:** (Adicionada) En lugar de redirigir a `/dashboard` en caso de `PERMISSION_DENIED`, se podría redirigir a una página `/unauthorized` que explique al usuario por qué no puede acceder al recurso, mejorando la claridad.
 */
// app/[locale]/dev-console/layout.tsx

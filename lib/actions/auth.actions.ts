// lib/actions/auth.actions.ts
/**
 * @file lib/actions/auth.actions.ts
 * @description Contiene las Server Actions relacionadas exclusivamente con la
 *              gestión de la sesión del usuario. La lógica de contraseñas ha sido
 *              consolidada en `password.actions.ts` para mantener una alta cohesión.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 2.0.0 (High Cohesion & DRY Refactoring)
 *
 * @functionality
 * - **Cierre de Sesión Seguro**: Proporciona una única acción `signOutAction` para
 *   terminar la sesión del usuario de forma segura.
 * - **Registro de Auditoría**: Antes de cerrar la sesión, registra el evento
 *   para fines de seguridad y trazabilidad.
 * - **Redirección Centralizada**: Asegura que el usuario sea redirigido a la página
 *   de inicio después de cerrar sesión, manteniendo un flujo de usuario consistente.
 *
 * @relationships
 * - Es invocado desde varios componentes de la UI (ej. `DashboardSidebar`, `DashboardHeader`).
 * - Depende del helper de auditoría (`_helpers/audit-log.helper.ts`).
 * - Interactúa con la API de autenticación de Supabase a través del cliente de servidor.
 */
"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function signOutAction
 * @description Cierra la sesión del usuario actual, registra el evento de auditoría
 *              y redirige a la página de inicio.
 * @returns {Promise<void>}
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await createAuditLog("user_sign_out", { userId: session.user.id });
  }

  await supabase.auth.signOut();
  return redirect("/");
}

/**
 * @section MEJORA CONTINUA
 * @description Mejoras incrementales para la gestión de la sesión.
 *
 * @subsection Mejoras Futuras
 * 1. **Cierre de Sesión Global (Global Sign-Out)**: ((Vigente)) Implementar una opción o una acción separada que utilice `supabase.auth.signOut({ scope: 'global' })` para invalidar todas las sesiones activas del usuario en todos los dispositivos, una característica de seguridad importante.
 * 2. **Redirección a Página de Despedida**: ((Vigente)) En lugar de redirigir a la raíz (`/`), se podría redirigir a una página `/logged-out` que muestre un mensaje de confirmación "Has cerrado sesión correctamente", mejorando el feedback al usuario.
 * 3. **Integración con Analytics**: ((Vigente)) Justo antes de la redirección, se podría disparar un evento de analíticas (ej. `analytics.track('User Signed Out')`) para un seguimiento más preciso del comportamiento del usuario.
 */
// lib/actions/auth.actions.ts

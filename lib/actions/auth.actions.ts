// lib/actions/auth.actions.ts
/**
 * @file lib/actions/auth.actions.ts
 * @description Contiene las Server Actions relacionadas exclusivamente con la
 *              gestión de la sesión del usuario. La lógica de contraseñas ha sido
 *              consolidada en `password.actions.ts` para mantener una alta cohesión.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 2.0.0 (High Cohesion & DRY Refactoring)
 */
"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function signOutAction
 * @description Encerra a sessão do usuário atual, registra o evento de auditoria
 *              e redireciona para a página inicial.
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
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la gestión de la sesión.
 *
 * 1.  **Cierre de Sesión Global (Global Sign-Out)**: Implementar una opción o una acción separada que utilice `supabase.auth.signOut({ scope: 'global' })` para invalidar todas las sesiones activas del usuario en todos los dispositivos, una característica de seguridad importante.
 * 2.  **Redirección a Página de Despedida**: En lugar de redirigir a la raíz (`/`), se podría redirigir a una página `/logged-out` que muestre un mensaje de confirmación "Has cerrado sesión correctamente", mejorando el feedback al usuario.
 * 3.  **Integración con Analytics**: Justo antes de la redirección, se podría disparar un evento de analíticas (ej. `analytics.track('User Signed Out')`) para un seguimiento más preciso del comportamiento del usuario en herramientas como Vercel Analytics o PostHog.
 */
// lib/actions/auth.actions.ts

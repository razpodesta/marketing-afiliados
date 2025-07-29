// Ruta: app/actions/session.actions.ts
/**
 * @file session.actions.ts
 * @description Contiene las Server Actions que gestionan el ciclo de vida de la sesión del usuario.
 *
 * @author Metashark
 * @version 1.0.0 (Feature Segregation)
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAuditLog } from "./_helpers/audit-log.helper";

/**
 * @description Cierra la sesión del usuario actual, registra el evento y lo redirige a la página de inicio.
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

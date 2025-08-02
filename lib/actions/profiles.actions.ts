// lib/actions/profiles.actions.ts
/**
 * @file profiles.actions.ts
 * @description Contiene las Server Actions relacionadas con el perfil del usuario,
 *              como la personalización de su dashboard.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 1.2.0 (Fix: Definitive Action Result Contract Alignment)
 * @see {@link file://./profiles.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la gestión del perfil de usuario.
 *
 * 1.  **Acción de Actualización de Perfil Completa (`updateProfileAction`):** (Vigente) Crear una nueva Server Action que permita al usuario actualizar `full_name` y `avatar_url`.
 * 2.  **Gestión de Preferencias de UI:** (Vigente) Expandir el sistema para guardar más preferencias del usuario en la tabla `profiles`, como el tema preferido o el estado de la barra lateral.
 * 3.  **Validación de `moduleIds`:** (Vigente) Añadir una validación en el servidor que verifique que todos los IDs en el array `moduleIds` corresponden a módulos existentes.
 */
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { type ActionResult } from "@/lib/validators";

export async function updateDashboardLayoutAction(
  moduleIds: string[]
): Promise<ActionResult<void>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ dashboard_layout: moduleIds })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "No se pudo guardar el layout." };
  }

  revalidatePath("/dashboard", "layout");

  // CORRECCIÓN ESTRUCTURAL: Se incluye explícitamente la propiedad `data` para
  // cumplir con el contrato de tipo `ActionResult<void>`.
  return { success: true, data: undefined };
}
// lib/actions/profiles.actions.ts

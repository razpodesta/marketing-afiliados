// lib/actions/profiles.actions.ts
/**
 * @file profiles.actions.ts
 * @description Contiene las Server Actions relacionadas con la gestión y personalización
 *              del perfil del usuario, como la disposición de su dashboard.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 2.0.0 (Enhanced Documentation & Type Safety)
 * @see {@link file://./tests/lib/actions/profiles.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @functionality
 * - **Actualización de Layout**: Proporciona `updateDashboardLayoutAction` para que los
 *   usuarios puedan guardar su disposición de módulos preferida en el dashboard.
 * - **Seguridad**: Valida la sesión del usuario antes de realizar cualquier mutación.
 * - **Revalidación de Caché**: Invalida la caché del layout del dashboard para que
 *   los cambios se reflejen inmediatamente en la siguiente carga.
 *
 * @relationships
 * - Es invocado desde componentes de cliente interactivos como `DashboardClient`.
 * - Depende de `lib/supabase/server` para la interacción con la base de datos.
 * - Modifica la tabla `profiles` de la base de datos.
 */
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { type ActionResult } from "@/lib/validators";

/**
 * @async
 * @function updateDashboardLayoutAction
 * @description Actualiza el orden de los módulos en el dashboard para el usuario autenticado.
 * @param {string[]} moduleIds - Un array de IDs de módulos en el nuevo orden deseado.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación, que puede ser un éxito o un fallo con un mensaje de error.
 */
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

  return { success: true, data: undefined };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Acción de Actualización de Perfil Completa (`updateProfileAction`):** ((Vigente)) Crear una nueva Server Action que permita al usuario actualizar su `full_name` y `avatar_url`, validando los datos con Zod.
 * 2. **Gestión de Preferencias de UI**: ((Vigente)) Expandir el sistema para guardar más preferencias del usuario en la tabla `profiles`, como el tema preferido (claro/oscuro) o el estado de la barra lateral (colapsada/expandida), a través de una acción `updateUserPreferencesAction`.
 * 3. **Validación de `moduleIds`**: ((Vigente)) Antes de guardar, la acción podría añadir una validación en el servidor que verifique que todos los IDs en el array `moduleIds` corresponden a módulos existentes en la tabla `feature_modules`, previniendo datos corruptos.
 */
// lib/actions/profiles.actions.ts

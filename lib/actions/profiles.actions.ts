// Ruta: lib/actions/profiles.actions.ts
/**
 * @file profiles.actions.ts
 * @description Contiene las Server Actions relacionadas con el perfil del usuario,
 *              como la personalización de su dashboard.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 1.1.0 (Path & Contract Correction)
 */
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
// CORRECCIÓN CRÍTICA: Se corrige la ruta de importación para apuntar al
// archivo de validadores centralizado.
import { type ActionResult } from "@/lib/validators";

/**
 * @async
 * @function updateDashboardLayoutAction
 * @description Actualiza el layout personalizado del dashboard (orden de los módulos)
 *              para el usuario actualmente autenticado.
 * @param {string[]} moduleIds - Un array de IDs de módulos en el nuevo orden deseado.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function updateDashboardLayoutAction(
  moduleIds: string[]
): Promise<ActionResult> {
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

  // Revalidamos el layout del dashboard para que la próxima carga refleje el nuevo orden.
  revalidatePath("/dashboard", "layout");

  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión del perfil de usuario.
 *
 * 1.  **Acción de Actualización de Perfil Completa (`updateProfileAction`):** Crear una nueva Server Action que permita al usuario actualizar otros campos de su perfil, como `full_name` y `avatar_url`. Esta acción debería validar los datos con Zod y podría manejar la subida de avatares a Supabase Storage.
 * 2.  **Gestión de Preferencias de UI:** Expandir el sistema para guardar más preferencias del usuario en la tabla `profiles`, como el tema preferido (`dark`/`light`) o el estado de la barra lateral (colapsada/expandida), y crear acciones para actualizarlas.
 * 3.  **Validación de `moduleIds`:** La acción `updateDashboardLayoutAction` actualmente confía en que el array `moduleIds` es válido. Se podría añadir una validación en el servidor que verifique que todos los IDs en el array corresponden a módulos existentes en la base de datos antes de guardar, previniendo la inserción de datos corruptos.
 */

/**
 * @fileoverview El aparato `profiles.actions.ts` gestiona las operaciones de modificación del perfil de un usuario.
 * @functionality
 * - Proporciona Server Actions que permiten a los usuarios personalizar su experiencia en la aplicación.
 * - La acción `updateDashboardLayoutAction` permite a los usuarios guardar el orden personalizado de los módulos en su dashboard.
 * - Cada acción realiza una comprobación de autenticación para asegurar que solo los usuarios logueados puedan modificar su propio perfil.
 * @relationships
 * - Es invocado por componentes de cliente que ofrecen opciones de personalización, como el `DashboardClient` (`app/[locale]/dashboard/dashboard-client.tsx`).
 * - Interactúa directamente con la tabla `profiles` en la base de datos.
 * - Utiliza `revalidatePath` de Next.js para asegurar que los cambios se reflejen inmediatamente en la UI.
 * @expectations
 * - Se espera que este aparato contenga todas las acciones relacionadas con la modificación de los datos del perfil del usuario que no estén directamente relacionadas con la autenticación (que se maneja en `auth.actions.ts`). Debe ser seguro y eficiente.
 */
// Ruta: lib/actions/profiles.actions.ts

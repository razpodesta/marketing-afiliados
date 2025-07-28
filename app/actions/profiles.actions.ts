// Ruta: app/actions/profiles.actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "./schemas";

/**
 * @description Actualiza el layout personalizado del dashboard para el usuario actual.
 * @param {string[]} moduleIds - Un array de IDs de módulos en el nuevo orden.
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

  // Revalidamos el layout del dashboard para que la próxima carga refleje el nuevo orden
  revalidatePath("/dashboard", "layout");
  return { success: true, data: null };
}

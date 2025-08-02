// lib/actions/admin.actions.ts
/**
 * @file lib/actions/admin.actions.ts
 * @description Contiene Server Actions restringidas a roles administrativos ('admin', 'developer').
 *              Estas acciones son sensibles y exigen verficación rigurosa de permisos.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 2.6.0 (Fix: Definitive Action Result Contract Alignment)
 * @see {@link file://./admin.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para robustecer las acciones administrativas.
 *
 * 1.  **Transacciones de Base de Datos:** (Vigente) Para operaciones que involucran múltiples escrituras, envolverlas en una transacción (RPC) para garantizar la atomicidad.
 * 2.  **Protección Contra Auto-Modificación Crítica:** (Vigente) Implementar lógica para impedir que el último administrador/desarrollador sea degradado de rol.
 * 3.  **Mensajes de Error Específicos:** (Vigente) Mapear códigos de error de Supabase a mensajes amigables para el usuario.
 */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

export async function impersonateUserAction(
  userId: string
): Promise<ActionResult<{ signInLink: string }>> {
  const roleCheck = await requireAppRole(["developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  if (roleCheck.data.user.id === userId) {
    return { success: false, error: "Você não pode personificar a si mesmo." };
  }

  const adminSupabase = createAdminClient();
  const { data: userData, error: userError } =
    await adminSupabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    logger.error(
      `[AdminActions] Erro ao obter usuário para personificação ${userId}:`,
      userError
    );
    return { success: false, error: "Usuário não encontrado." };
  }

  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: userData.user.email!,
  });

  if (error) {
    logger.error(
      `[AdminActions] Erro ao gerar link de personificação para ${userId}:`,
      error
    );
    return {
      success: false,
      error: "Não foi possível gerar o link de personificação.",
    };
  }

  const signInLink = data.properties.action_link;

  await createAuditLog("user_impersonated", {
    userId: roleCheck.data.user.id,
    targetEntityId: userId,
    targetEntityType: "user",
    metadata: { impersonatedEmail: userData.user.email },
  });

  return { success: true, data: { signInLink } };
}

export async function deleteSiteAsAdminAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const roleCheck = await requireAppRole(["admin", "developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { success: false, error: "Subdomínio ausente." };

  const adminSupabase = createAdminClient();
  const { error, data: deletedSite } = await adminSupabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain)
    .select("id, subdomain")
    .single();

  if (error || !deletedSite) {
    logger.error(`[AdminActions] Erro ao excluir o site ${subdomain}:`, error);
    return { success: false, error: "Não foi possível excluir o site." };
  }

  revalidateTag(`sites:${subdomain}`);
  revalidatePath("/admin");

  await createAuditLog("site_deleted_admin", {
    userId: roleCheck.data.user.id,
    targetEntityId: deletedSite.id,
    targetEntityType: "site",
    metadata: { subdomain: deletedSite.subdomain },
  });

  return {
    success: true,
    data: { message: `Site ${subdomain} excluído corretamente.` },
  };
}

export async function updateUserRoleAction(
  userId: string,
  newRole: Database["public"]["Enums"]["app_role"]
): Promise<ActionResult<void>> {
  const roleCheck = await requireAppRole(["developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  if (roleCheck.data.user.id === userId) {
    return { success: false, error: "Você não pode mudar o seu próprio role." };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ app_role: newRole })
    .eq("id", userId);

  if (error) {
    logger.error(
      `[AdminActions] Erro ao atualizar role para ${userId}:`,
      error
    );
    return { success: false, error: "Não foi possível atualizar o role." };
  }

  revalidatePath("/dev-console/users");

  await createAuditLog("user_role_updated", {
    userId: roleCheck.data.user.id,
    targetEntityId: userId,
    targetEntityType: "user",
    metadata: { newRole },
  });

  return { success: true, data: undefined };
}
// lib/actions/admin.actions.ts

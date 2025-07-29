// Ruta: lib/actions/admin.actions.ts
/**
 * @file lib/actions/admin.actions.ts
 * @description Contiene Server Actions restringidas a roles administrativos ('admin', 'developer').
 *              Estas acciones son sensibles y exigen verficación rigurosa de permisos.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.5.0 (Action Result Contract Alignment)
 */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function impersonateUserAction
 * @description Gera um link de login mágico para personificar um usuário.
 *              Restrito ao role 'developer'.
 * @param {string} userId - O ID do usuário a ser personificado.
 * @returns {Promise<ActionResult<{ signInLink: string }>>} O resultado com o link de login.
 */
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

/**
 * @description Exclui um site da plataforma.
 * @param {FormData} formData - Deve conter o 'subdomain' a ser excluído.
 * @returns {Promise<ActionResult<{ message: string }>>} O resultado da operação.
 */
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

/**
 * @description Atualiza o role de um usuário. Ação restrita ao role 'developer'.
 * @param {string} userId - O UUID do usuário a ser modificado.
 * @param {Database["public"]["Enums"]["app_role"]} newRole - O novo role a ser atribuído.
 * @returns {Promise<ActionResult>} O resultado da operação.
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: Database["public"]["Enums"]["app_role"]
): Promise<ActionResult> {
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

  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer las acciones administrativas.
 *
 * 1.  **Mensajes de Error Específicos:** (Revalidado) Para algunas fallas de base de datos, las mensajes de error pueden ser más específicos, usando un mapeo de códigos de error de Supabase a mensajes amigables para el usuario.
 * 2.  **Protección Contra Auto-Modificación Crítica:** (Revalidado) Implementar lógica para impedir que el último administrador/desarrollador sea rebaixado de rol o excluido, garantizando que siempre haya acceso administrativo a la plataforma.
 * 3.  **Transacciones de Base de Datos:** Para operaciones que involucran múltiples escrituras (ej. crear una entidad y luego un log de auditoría), envolverlas en una transacción de base de datos (usando una función RPC de PostgreSQL) para garantizar la atomicidad. Si una parte falla, todo se revierte.
 */

/**
 * @fileoverview El aparato `admin.actions.ts` contiene Server Actions de alta sensibilidad.
 * @functionality
 * - Proporciona funcionalidades que solo los roles de `admin` o `developer` pueden ejecutar.
 * - Cada acción comienza con una llamada al Guardián de Permisos (`requireAppRole`) como primera línea de defensa.
 * - Implementa operaciones que eluden las políticas de RLS utilizando un cliente de Supabase con privilegios de administrador (`createAdminClient`).
 * - Realiza un logging de auditoría detallado para cada operación exitosa.
 * @relationships
 * - Es consumido por los componentes de cliente en el área de administración (`app/[locale]/admin/`) y en la consola de desarrollador (`app/[locale]/dev-console/`).
 * - Depende críticamente del `lib/auth/user-permissions.ts` para la autorización.
 * - Utiliza `lib/supabase/server.ts` para crear el cliente de administrador.
 * @expectations
 * - Se espera que este aparato sea el más seguro y vigilado del sistema. Cada nueva acción añadida aquí debe tener una justificación de seguridad clara y una comprobación de permisos explícita. El manejo de errores debe ser robusto para no exponer detalles de implementación del servidor al cliente.
 */
// Ruta: lib/actions/admin.actions.ts
/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Logging de Auditoria Detalhado: Implementação completa de `createAuditLog` para todas as ações críticas, incluindo IDs de entidade e metadados relevantes. (Implementado).
 * 2. Mensagens de Erro Específicas: Para algumas falhas de DB, as mensagens de erro podem ser mais específicas, talvez usando um mapeamento de códigos de erro Supabase para mensagens amigáveis.
 * 3. Proteção Contra Exclusão/Rebaixamento de Administrador Mestre: Implementar lógica para impedir que o último administrador/desenvolvedor seja rebaixado de role ou excluído, garantindo que sempre haja acesso administrativo à plataforma. (Mantido como melhoria futura).
 */

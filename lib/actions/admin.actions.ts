// lib/actions/admin.actions.ts
/**
 * @file lib/actions/admin.actions.ts
 * @description Contém Server Actions restringidas a roles administrativos ('admin', 'developer').
 *              Essas ações são sensíveis e exigem verificação rigorosa de permissões.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 2.4.0 (Type Fixes and Audit Log Integration)
 */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database"; // <-- CORREÇÃO: Importar Database
import { type ActionResult } from "@/lib/validators"; // Importa ActionResult de lib/validators

import { createAuditLog } from "./_helpers"; // Importa createAuditLog do barrel de helpers

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

  // Lógica adicional para garantir que o desenvolvedor não personifique a si mesmo
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
  // Precisamos selecionar o ID para o log de auditoria, já que 'subdomain' não é o ID.
  const { error, data: deletedSite } = await adminSupabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain)
    .select("id, subdomain") // Seleciona o ID e o subdomain do site excluído
    .single();

  if (error || !deletedSite) {
    logger.error(`[AdminActions] Erro ao excluir o site ${subdomain}:`, error);
    return { success: false, error: "Não foi possível excluir o site." };
  }

  revalidateTag(`sites:${subdomain}`);
  revalidatePath("/admin");

  // CORREÇÃO: Usar o ID real do site como targetEntityId. O subdomain pode ser metadados.
  await createAuditLog("site_deleted_admin", {
    userId: roleCheck.data.user.id,
    targetEntityId: deletedSite.id, // Usar o ID real do site excluído
    targetEntityType: "site",
    metadata: { subdomain: deletedSite.subdomain }, // Passar o subdomain como metadado
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

  // Lógica adicional para garantir que o desenvolvedor não mude o próprio role.
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

  return { success: true, data: null };
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Logging de Auditoria Detalhado: Implementação completa de `createAuditLog` para todas as ações críticas, incluindo IDs de entidade e metadados relevantes. (Implementado).
 * 2. Mensagens de Erro Específicas: Para algumas falhas de DB, as mensagens de erro podem ser mais específicas, talvez usando um mapeamento de códigos de erro Supabase para mensagens amigáveis.
 * 3. Proteção Contra Exclusão/Rebaixamento de Administrador Mestre: Implementar lógica para impedir que o último administrador/desenvolvedor seja rebaixado de role ou excluído, garantindo que sempre haja acesso administrativo à plataforma. (Mantido como melhoria futura).
 */

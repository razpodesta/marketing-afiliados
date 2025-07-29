// lib/actions/workspaces.actions.ts
/**
 * @file lib/actions/workspaces.actions.ts
 * @description Contém as Server Actions para a gestão de workspaces.
 *              Inclui validação de dados e verificações de permissões
 *              críticas para a arquitetura multi-tenant.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 3.4.0 (Imports and Audit Log Integration)
 */

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  type CreateWorkspaceFormState,
  InvitationSchema,
  type InviteMemberFormState,
  WorkspaceSchema,
} from "@/lib/validators"; // <-- CORREÇÃO: Importar de lib/validators

import { createAuditLog } from "./_helpers"; // <-- CORREÇÃO: Importar do barrel file de helpers

/**
 * @async
 * @function setActiveWorkspaceAction
 * @description Estabelece o workspace ativo para o usuário em um cookie e redireciona para o dashboard.
 * @param {string} workspaceId - O UUID do workspace a ser ativado.
 * @returns {Promise<void>}
 */
export async function setActiveWorkspaceAction(
  workspaceId: string
): Promise<void> {
  cookies().set("active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

/**
 * @async
 * @function createWorkspaceAction
 * @description Cria um novo workspace com um nome e um ícone, e atribui o usuário
 *              atual como proprietário em uma única transação atômica.
 * @param {CreateWorkspaceFormState} prevState - O estado anterior do formulário.
 * @param {FormData} formData - Os dados do formulário.
 * @returns {Promise<CreateWorkspaceFormState>} O novo estado do formulário.
 */
export async function createWorkspaceAction(
  prevState: CreateWorkspaceFormState,
  formData: FormData
): Promise<CreateWorkspaceFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado. Faça login novamente.", success: false };
  }

  const validation = WorkspaceSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    const formErrors = validation.error.flatten().fieldErrors;
    const errorMessage =
      formErrors.workspaceName?.[0] ||
      formErrors.icon?.[0] ||
      "Dados inválidos.";
    return { error: errorMessage, success: false };
  }

  const { workspaceName, icon } = validation.data;

  // Chamada RPC para criar o workspace e atribuir o proprietário atomicamente
  const { error, data: newWorkspace } = await supabase
    .rpc("create_workspace_with_owner", {
      owner_user_id: user.id,
      new_workspace_name: workspaceName,
      new_workspace_icon: icon,
    })
    .select("*")
    .single(); // Adicionar .select("*").single() para tipagem do RPC e retorno do objeto criado

  if (error || !newWorkspace) {
    logger.error(
      "[WorkspacesActions] Erro em RPC ao criar o workspace com ícone:",
      error
    );
    return { error: "Não foi possível criar o workspace.", success: false };
  }

  await createAuditLog("workspace_created", {
    userId: user.id,
    targetEntityId: newWorkspace.id,
    targetEntityType: "workspace",
    metadata: { workspaceName, icon },
  });

  revalidatePath("/dashboard", "layout");
  return { error: null, success: true };
}

/**
 * @description Cria um registro de convite para um novo membro em um workspace.
 *              Verifica se o usuário que convida tem as permissões necessárias.
 * @param {InviteMemberFormState} prevState - O estado anterior do formulário.
 * @param {FormData} formData - Os dados do formulário.
 * @returns {Promise<InviteMemberFormState>} O novo estado do formulário.
 */
export async function sendWorkspaceInvitationAction(
  prevState: InviteMemberFormState,
  formData: FormData
): Promise<InviteMemberFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // Ainda precisamos do user para checar o email de quem convida.

  if (!user) {
    return { error: "Não autenticado." };
  }

  const validation = InvitationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    return { error: "Dados de convite inválidos." };
  }

  const { email: inviteeEmail, role, workspaceId } = validation.data;

  if (inviteeEmail === user.email) {
    return { error: "Você não pode convidar a si mesmo." };
  }

  // REFACTORIZAÇÃO: Usar o novo aparato centralizado para verificar permissões de workspace.
  const permissionCheck = await requireWorkspacePermission(
    workspaceId,
    ["owner", "admin"] // Roles permitidos para enviar convites
  );

  if (!permissionCheck.success) {
    logger.warn(
      `[WorkspacesActions] Violação de segurança: Usuário ${user.id} tentou enviar convite para ${inviteeEmail} no workspace ${workspaceId} sem permissões. Motivo: ${permissionCheck.error}`
    );
    return { error: permissionCheck.error };
  }

  const { error: invitationError } = await supabase.from("invitations").insert({
    workspace_id: workspaceId,
    invitee_email: inviteeEmail,
    role: role,
    invited_by: user.id,
    status: "pending",
  });

  if (invitationError) {
    if (invitationError.code === "23505") {
      // Código para violação de unique constraint (convite duplicado)
      return {
        error:
          "Este usuário já foi convidado para este workspace ou já é membro.",
      };
    }
    logger.error(
      "[WorkspacesActions] Erro ao criar o convite:",
      invitationError
    );
    return { error: "Não foi possível enviar o convite." };
  }

  await createAuditLog("workspace_invitation_sent", {
    actorId: user.id,
    targetEntityId: workspaceId,
    targetEntityType: "workspace",
    metadata: { invitedEmail: inviteeEmail, role },
  });

  revalidatePath(`/dashboard/settings`); // Revalida a página de configurações onde os convites podem ser listados
  revalidateTag(`invitations:${inviteeEmail}`); // Opcional: tag para o usuário convidado.

  return { success: true, message: `Convite enviado para ${inviteeEmail}.` };
}

/**
 * @description Permite ao usuário autenticado aceitar um convite para um workspace.
 *              Invoca uma função RPC segura para garantir a integridade dos dados.
 * @param {string} invitationId - O ID do convite a ser aceito.
 * @returns {Promise<ActionResult<{ message: string }>>} O resultado da operação.
 */
export async function acceptInvitationAction(
  invitationId: string
): Promise<ActionResult<{ message: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("accept_workspace_invitation", {
    invitation_id: invitationId,
    accepting_user_id: user.id,
  });

  if (error) {
    logger.error("[WorkspacesActions] Erro em RPC ao aceitar convite:", error);
    return { success: false, error: "Não foi possível aceitar o convite." };
  }

  // O RPC retorna um JSON com { success: boolean, error?: string, message?: string }
  if (data && !data.success) {
    return { success: false, error: data.error };
  }

  await createAuditLog("workspace_invitation_accepted", {
    userId: user.id,
    targetEntityId: invitationId,
    targetEntityType: "invitation",
    metadata: { status: "accepted" },
  });

  // MELHORIA: Invalidar o cache de workspaces e convites para o usuário para atualização imediata na UI.
  revalidateTag(`workspaces:${user.id}`);
  revalidateTag(`invitations:${user.id}`);
  revalidatePath("/dashboard", "layout"); // Revalida o layout para que a sidebar e o switcher atualizem

  return {
    success: true,
    data: {
      message: data.message || "Você se juntou ao workspace com sucesso!",
    },
  };
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Envio de Email Real (sendWorkspaceInvitationAction): A melhoria mais crítica é integrar um serviço de e-mail transacional (e.g., Resend) para enviar e-mails com links de convite únicos e seguros, substituindo a simulação atual.
 * 2. Ação para Recusar Convite (`declineInvitationAction`): Criar uma nova Server Action que simplesmente atualize o status do convite para 'declined', permitindo ao usuário limpar sua lista de convites pendentes.
 * 3. Gestão de Convites Pendentes no UI: Criar uma nova página nas configurações do workspace que liste todos os convites pendentes enviados (pelo usuário atual), permitindo aos administradores reenviar ou revogar convites.
 * 4. Notificações em Tempo Real (useRealtimeInvitations): Garantir que as Server Actions de convite/aceitação/recusa ativem a atualização em tempo real (`router.refresh()` ou triggers específicos do Supabase Realtime) para atualizações instantâneas na UI. (Já previsto no TSDoc).
 * 5. Log de Auditoria Detalhado: Garantir que `createAuditLog` seja chamado consistentemente para todas as ações de criação, atualização e exclusão, com metadados relevantes. (Já implementado).
 */

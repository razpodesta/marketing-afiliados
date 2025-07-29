// lib/actions/campaigns.actions.ts
/**
 * @file lib/actions/campaigns.actions.ts
 * @description Contém as Server Actions para a gestão de campanhas,
 *              incluindo validação de dados e verificações de permissões
 *              críticas para a arquitetura multi-tenant.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 2.1.0 (Centralized Permissions & Audit Log Integration)
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult } from "@/lib/validators"; // <-- CORREÇÃO: Importar de lib/validators

import { createAuditLog } from "./_helpers"; // <-- NOVA IMPORTAÇÃO: Audit Log

/**
 * @description Esquema de validação para a criação de uma nova campanha.
 */
const CampaignSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  siteId: z.string().uuid("ID de site inválido."),
});

/**
 * @description Cria uma nova campanha para um site específico.
 * @param {any} prevState - Estado anterior do formulário.
 * @param {FormData} formData - Dados do formulário.
 * @returns {Promise<ActionResult>} O resultado da operação.
 */
export async function createCampaignAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const validation = CampaignSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.flatten().fieldErrors.name?.[0] || "Dados inválidos.",
    };
  }

  const { name, siteId } = validation.data;

  // REFACTORIZAÇÃO: Usar o novo aparato centralizado para verificar permissões de workspace.
  // A função requireWorkspacePermission buscará o workspace_id do site internamente.
  const permissionCheck = await requireWorkspacePermission(siteId, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    logger.warn(
      `[CampaignsActions] Violação de segurança: Usuário ${user.id} tentou criar uma campanha no site ${siteId} sem permissões. Motivo: ${permissionCheck.error}`
    );
    return {
      success: false,
      error: permissionCheck.error,
    };
  }

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const { error, data: newCampaign } = await supabase
    .from("campaigns")
    .insert({ name, site_id: siteId, slug })
    .select("id")
    .single();

  if (error || !newCampaign) {
    logger.error(
      `[CampaignsActions] Erro ao criar a campanha para o site ${siteId}:`,
      error
    );
    return { success: false, error: "Não foi possível criar a campanha." };
  }

  await createAuditLog("campaign_created", {
    userId: user.id,
    targetEntityId: newCampaign.id,
    targetEntityType: "campaign",
    metadata: { name, siteId },
  });

  revalidatePath(`/dashboard/sites/${siteId}/campaigns`);
  return { success: true, data: null };
}

/**
 * @description Exclui uma campanha específica.
 * @param {FormData} formData - Deve conter `campaignId`.
 * @returns {Promise<ActionResult>} O resultado da operação.
 */
export async function deleteCampaignAction(
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const campaignId = formData.get("campaignId") as string;
  if (!campaignId)
    return { success: false, error: "ID de campanha não fornecido." };

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("site_id, name") // Incluir 'name' para o log de auditoria
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return { success: false, error: "Campanha não encontrada." };
  }

  // REFACTORIZAÇÃO: Usar o novo aparato centralizado para verificar permissões de workspace.
  const permissionCheck = await requireWorkspacePermission(campaign.site_id, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    logger.warn(
      `[CampaignsActions] Violação de segurança: Usuário ${user.id} tentou excluir a campanha ${campaignId} (Site: ${campaign.site_id}) sem permissões. Motivo: ${permissionCheck.error}`
    );
    return {
      success: false,
      error: permissionCheck.error,
    };
  }

  const { error: deleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId);

  if (deleteError) {
    logger.error(
      `[CampaignsActions] Erro ao excluir a campanha ${campaignId}:`,
      deleteError
    );
    return { success: false, error: "Não foi possível excluir a campanha." };
  }

  await createAuditLog("campaign_deleted", {
    userId: user.id,
    targetEntityId: campaignId,
    targetEntityType: "campaign",
    metadata: { name: campaign.name, siteId: campaign.site_id },
  });

  revalidatePath(`/dashboard/sites/${campaign.site_id}/campaigns`);
  return { success: true, data: null };
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Geração de Slugs Únicos: A lógica atual de geração de slugs é simples e pode produzir duplicatas. Deve ser melhorada para que, se um slug já existir dentro de um site, um sufixo numérico (e.g., `minha-campanha-2`) seja adicionado.
 * 2. Ação de Atualização (`updateCampaignAction`): Implementar uma Server Action para modificar os detalhes de uma campanha (como nome ou slug), incluindo as mesmas verificações de permissão rigorosas.
 * 3. Logging de Auditoria Completo: `createAuditLog` já está sendo chamado consistentemente com metadados relevantes.
 * 4. Templates de Campanha: Permitir que os usuários escolham um template ao criar uma campanha, populando o campo `content` com uma estrutura inicial pré-definida.
 */

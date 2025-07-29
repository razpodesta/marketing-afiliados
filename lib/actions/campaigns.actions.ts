// Ruta: lib/actions/campaigns.actions.ts
/**
 * @file lib/actions/campaigns.actions.ts
 * @description Contiene las Server Actions para la gestión de campañas.
 *              Este aparato orquesta la lógica de negocio para crear y eliminar campañas,
 *              asegurando que cada operación sea validada, autorizada, ejecutada y auditada
 *              de forma segura y transaccional.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.1.0 (Action Result Contract Alignment)
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { sites as sitesData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

// Única fuente de verdad para la forma de los datos de creación de una campaña.
const CampaignSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  siteId: z.string().uuid("ID de site inválido."),
});

/**
 * @async
 * @function createCampaignAction
 * @description Orquesta la creación de una nueva campaña para un sitio específico.
 * @param {any} prevState - Estado anterior del formulario (no utilizado).
 * @param {FormData} formData - Datos del formulario.
 * @returns {Promise<ActionResult>} El resultado de la operación para la UI.
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

  const site = await sitesData.getSiteById(siteId);
  if (!site) {
    return {
      success: false,
      error: "Sitio asociado no encontrado. No se puede crear la campaña.",
    };
  }

  const permissionCheck = await requireWorkspacePermission(site.workspace_id, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    return { success: false, error: permissionCheck.error };
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
    return { success: false, error: "Não foi possível criar a campaña." };
  }

  await createAuditLog("campaign_created", {
    userId: user.id,
    targetEntityId: newCampaign.id,
    targetEntityType: "campaign",
    metadata: { name, siteId, workspaceId: site.workspace_id },
  });

  revalidatePath(`/dashboard/sites/${siteId}/campaigns`);
  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @async
 * @function deleteCampaignAction
 * @description Orquesta la exclusión de una campaña específica.
 * @param {FormData} formData - Debe contener `campaignId`.
 * @returns {Promise<ActionResult>} El resultado de la operación.
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
    .select("site_id, name")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return { success: false, error: "Campanha não encontrada." };
  }

  const site = await sitesData.getSiteById(campaign.site_id);
  if (!site) {
    logger.error(
      `[CampaignsActions] Inconsistencia de datos: La campaña ${campaignId} está asociada a un sitio (${campaign.site_id}) que no existe.`
    );
    return {
      success: false,
      error:
        "Error de integridad de datos. El sitio asociado a esta campaña no existe.",
    };
  }

  const permissionCheck = await requireWorkspacePermission(site.workspace_id, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    return { success: false, error: permissionCheck.error };
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
    metadata: {
      name: campaign.name,
      siteId: campaign.site_id,
      workspaceId: site.workspace_id,
    },
  });

  revalidatePath(`/dashboard/sites/${campaign.site_id}/campaigns`);
  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de campañas.
 *
 * 1.  **Generación de Slugs Únicos:** (Revalidado) La lógica actual de generación de slugs puede producir duplicados. Debe ser mejorada para añadir un sufijo numérico si un slug ya existe.
 * 2.  **Acción de Actualización (`updateCampaignAction`):** (Revalidado) Implementar una Server Action para modificar los detalles de una campaña (como nombre o slug).
 * 3.  **Templates de Campaña:** (Revalidado) Permitir a los usuarios elegir un template al crear una campaña, populando el campo `content` con una estructura inicial.
 */

/**
 * @fileoverview El aparato `campaigns.actions.ts` contiene las Server Actions para las operaciones CRUD de las campañas.
 * @functionality
 * - Define las operaciones de negocio para crear y eliminar campañas.
 * - Cada acción implementa un flujo robusto: validación de entrada, obtención de contexto, verificación de permisos, ejecución de la operación de base de datos y, finalmente, auditoría y revalidación de caché.
 * - Asegura que solo los usuarios autorizados (miembros del workspace) puedan realizar modificaciones.
 * @relationships
 * - Es invocado por los componentes de cliente en `app/[locale]/dashboard/sites/[siteId]/campaigns/`.
 * - Depende críticamente del Guardián de Permisos (`lib/auth/user-permissions.ts`) para la autorización.
 * - Utiliza la capa de datos (`lib/data/sites.ts`) para obtener el contexto de seguridad necesario (el `workspace_id` de un sitio).
 * @expectations
 * - Se espera que este aparato sea la única vía para modificar las entidades de campaña, encapsulando toda la lógica de negocio y seguridad relevante. Debe ser transaccional y proporcionar un feedback claro a la UI a través del `ActionResult`.
 */
// Ruta: lib/actions/campaigns.actions.ts
/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Geração de Slugs Únicos: A lógica atual de geração de slugs é simples e pode produzir duplicatas. Deve ser melhorada para que, se um slug já existir dentro de um site, um sufixo numérico (e.g., `minha-campanha-2`) seja adicionado.
 * 2. Ação de Atualização (`updateCampaignAction`): Implementar uma Server Action para modificar os detalhes de uma campanha (como nome ou slug), incluindo as mesmas verificações de permissão rigorosas.
 * 3. Logging de Auditoria Completo: `createAuditLog` já está sendo chamado consistentemente com metadados relevantes.
 * 4. Templates de Campanha: Permitir que os usuários escolham um template ao criar uma campanha, populando o campo `content` com uma estrutura inicial pré-definida.
 */

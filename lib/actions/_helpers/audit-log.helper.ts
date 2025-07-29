// lib/actions/_helpers/audit-log.helper.ts
/**
 * @file lib/actions/_helpers/audit-log.helper.ts
 * @description Helper para registrar eventos de auditoria na base de dados.
 *              É uma peça crucial para a segurança e rastreabilidade da plataforma.
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Creation)
 */
"use server"; // Este helper é um Server Module.

import { headers } from "next/headers";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Json } from "@/lib/types/database/_shared"; // Usar o tipo Json compartilhado

/**
 * @async
 * @function createAuditLog
 * @description Registra um evento de auditoria em uma tabela `audit_logs` no banco de dados.
 *              Captura informações como a ação, o usuário que a realizou, a entidade alvo,
 *              detalhes adicionais e o endereço IP.
 *              A tabela `audit_logs` deve existir no esquema `public` do Supabase com as colunas:
 *              `id`, `created_at`, `actor_id` (nullable), `action`, `target_entity_id` (nullable),
 *              `target_entity_type` (nullable), `metadata` (jsonb), `ip_address`.
 * @param {string} action - O nome da ação realizada (e.g., "user.login", "site.created", "workspace.member.invited").
 * @param {object} details - Um objeto contendo detalhes adicionais sobre o evento.
 * @param {string} [details.userId] - O ID do usuário que realizou a ação, se aplicável.
 * @param {string} [details.targetEntityId] - O ID da entidade afetada pela ação (e.g., site_id, campaign_id).
 * @param {string} [details.targetEntityType] - O tipo da entidade afetada (e.g., "site", "campaign").
 * @param {Json} [details.metadata] - Quaisquer outros metadados relevantes em formato JSON.
 */
export async function createAuditLog(
  action: string,
  details: {
    userId?: string;
    targetEntityId?: string;
    targetEntityType?: string;
    [key: string]: any;
  }
) {
  try {
    const supabase = createClient();
    const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";

    const { error } = await supabase.from("audit_logs").insert({
      action,
      actor_id: details.userId,
      target_entity_id: details.targetEntityId,
      target_entity_type: details.targetEntityType,
      metadata: (details.metadata as Json) || {}, // Garante que metadata seja Json
      ip_address: ip,
    });

    if (error) {
      logger.error(
        "[AuditLogHelper] Não foi possível salvar o log de auditoria:",
        error
      );
    }
  } catch (e) {
    logger.error("[AuditLogHelper] Falha crítica ao tentar salvar o log:", e);
  }
}

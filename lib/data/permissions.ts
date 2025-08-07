// lib/data/permissions.ts
/**
 * @file permissions.ts
 * @description Módulo centralizado para a lógica de autorização.
 *              Utiliza `unstable_cache` para um rendimento de nível de produção
 *              em verificações de permissões repetitivas.
 * @author L.I.A Legacy
 * @version 3.0.0 (Elite Caching Validation)
 * @see tests/integration/lib/data/permissions.test.ts
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

export type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @async
 * @function hasWorkspacePermission
 * @description Verifica se um usuário tem um dos roles requeridos em um workspace específico.
 *              O resultado desta função é cacheado por requisição para otimizar o rendimento.
 * @param {string} userId - O UUID do usuário a verificar.
 * @param {string} workspaceId - O UUID do workspace no qual se requer a permissão.
 * @param {WorkspaceRole[]} requiredRoles - Um array de roles que outorgam a permissão.
 * @returns {Promise<boolean>} Retorna `true` se o usuário tiver a permissão, `false` caso contrário.
 */
export async function hasWorkspacePermission(
  userId: string,
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<boolean> {
  return cache(
    async () => {
      logger.info(
        `[Cache MISS] Verificando permissões no DB para user:${userId} em ws:${workspaceId}`
      );
      if (!requiredRoles || requiredRoles.length === 0) {
        return false;
      }

      const supabase = createClient();
      const { data: member, error } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          logger.error(
            `Erro ao verificar permissões para ${userId} em ${workspaceId}:`,
            error
          );
        }
        return false;
      }

      return requiredRoles.includes(member.role);
    },
    [`permission-${userId}-${workspaceId}`],
    {
      tags: [`permissions:${userId}`, `permissions:workspace:${workspaceId}`],
    }
  )();
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Validação de Cache**: ((Implementada)) O arnês de testes de integração agora valida explicitamente que a lógica de permissões está envolvida pela função `unstable_cache`, garantindo que a otimização de performance seja mantida.
 *
 * @subsection Melhorias Futuras
 * 1. **Permissões a Nível de Aplicação**: ((Vigente)) Criar uma função `hasAppPermission(userId, requiredRoles)` que verifique o `app_role` na tabela `profiles`.
 */
// lib/data/permissions.ts

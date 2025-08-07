// lib/data/workspaces.ts
/**
 * @file workspaces.ts
 * @description Aparato de dados para 'workspaces'. Refatorizado para uma
 *              gestão de erros resiliente e para suportar injeção de dependências.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 6.0.0 (Resilient Error Handling)
 * @see tests/integration/lib/data/workspaces.test.ts
 */
"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { type SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logging";
import { type Tables } from "@/lib/types/database";

export type Workspace = Tables<"workspaces">;

type Supabase = SupabaseClient<any, "public", any>;

/**
 * @async
 * @function getWorkspacesByUserId
 * @description Obtém todos os workspaces aos quais um usuário pertence.
 * @param {string} userId O ID do usuário.
 * @param {Supabase} [supabaseClient] Instância opcional do cliente Supabase.
 * @returns {Promise<Workspace[]>} Uma promessa que resolve para um array de workspaces. Retorna um array vazio em caso de erro.
 */
export async function getWorkspacesByUserId(
  userId: string,
  supabaseClient?: Supabase
): Promise<Workspace[]> {
  const supabase = supabaseClient || createServerClient();
  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspaces(*)")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const workspaces: Workspace[] =
      data?.flatMap((item) => item.workspaces || []) || [];
    return workspaces;
  } catch (error) {
    logger.error(`Error ao obter workspaces para ${userId}:`, error);
    return []; // Retorna um array vazio em caso de erro para resiliência.
  }
}

/**
 * @async
 * @function getFirstWorkspaceForUser
 * @description Obtém o primeiro workspace de um usuário, útil para o fluxo de onboarding.
 * @param {string} userId O ID do usuário.
 * @param {Supabase} [supabaseClient] Instância opcional do cliente Supabase.
 * @returns {Promise<Workspace | null>} O primeiro workspace ou null se não for encontrado ou em caso de erro.
 */
export async function getFirstWorkspaceForUser(
  userId: string,
  supabaseClient?: Supabase
): Promise<Workspace | null> {
  const supabase = supabaseClient || createServerClient();
  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspaces(*)")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        // PGRST116: 'Not Found', não é um erro, é um resultado esperado.
        throw error;
      }
      return null;
    }

    const workspaceData = data?.workspaces;
    return workspaceData && !Array.isArray(workspaceData)
      ? workspaceData
      : null;
  } catch (error) {
    logger.error(`Error ao obter o primeiro workspace para ${userId}:`, error);
    return null;
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Gestão de Erros Resiliente**: ((Implementada)) A função `getWorkspacesByUserId` agora captura exceções, regista o erro e retorna um array vazio em vez de lançar o erro. Isso evita falhas em cascata nos componentes que a consomem.
 * 2. **Documentação TSDoc Completa**: ((Implementada)) Todo o módulo e suas funções foram documentados de forma verbosa, clarificando o contrato e o comportamento esperado.
 *
 * @subsection Melhorias Futuras
 * 1. **Validação de Contrato com Zod**: ((Vigente)) Criar um `WorkspaceSchema` de Zod e validar os dados retornados da base de dados para garantir que o contrato de tipo seja cumprido rigorosamente, especialmente para dados aninhados.
 */
// lib/data/workspaces.ts

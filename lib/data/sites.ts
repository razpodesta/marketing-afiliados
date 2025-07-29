// lib/data/sites.ts
/**
 * @file lib/data/sites.ts
 * @description Aparato de dados especializado para todas as consultas
 *              relacionadas com a entidade 'sites'. Garante tipagem forte
 *              e otimizações de cache para performance.
 * @author L.I.A Legacy
 * @version 3.2.0 (Refined Site Info Types)
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";
import { rootDomain } from "@/lib/utils";

/**
 * @typedef {object} SiteWithCampaignsCount
 * @description Este tipo define o contrato de dados para a UI do dashboard.
 *              Inclui um array de objetos de contagem de campanhas para cada site.
 * @property {Array<{count: number}>} campaigns - Supabase retorna a contagem de uma relação como um array de objetos.
 */
export type SiteWithCampaignsCount = Tables<"sites"> & {
  campaigns: { count: number }[];
};

/**
 * @typedef {object} SiteBasicInfo
 * @description Tipo parcial para informações básicas de um site, usado quando apenas
 *              alguns campos são necessários (e.g., para verificações de permissão).
 * @property {string} id - O UUID do site.
 * @property {string | null} subdomain - O subdomínio do site.
 * @property {string} workspace_id - O ID do workspace ao qual o site pertence.
 */
export type SiteBasicInfo = Pick<
  Tables<"sites">,
  "id" | "subdomain" | "workspace_id"
>; // <-- NOVO TIPO

/**
 * @async
 * @function getSitesByWorkspaceId
 * @description Obtém uma lista paginada de sites para um workspace específico,
 *              incluindo a contagem de campanhas associadas. Suporta filtragem por query.
 * @param {string} workspaceId - O ID do workspace.
 * @param {object} options - Opções de paginação e busca.
 * @param {number} [options.page=1] - O número da página a ser recuperada.
 * @param {number} [options.limit=9] - O número de itens por página.
 * @param {string} [options.query=""] - A string de busca para filtrar por subdomínio.
 * @returns {Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }>} A lista de sites e o total de registros.
 * @throws {Error} Se a consulta ao banco de dados falhar.
 */
export async function getSitesByWorkspaceId(
  workspaceId: string,
  {
    page = 1,
    limit = 9,
    query: searchQuery = "",
  }: { page?: number; limit?: number; query?: string }
): Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("sites")
    .select(
      `
      *,
      campaigns (
        count
      )
    `,
      { count: "exact" }
    )
    .eq("workspace_id", workspaceId);

  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("subdomain", `%${searchQuery}%`);
  }

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      `[DataLayer:Sites] Erro ao obter sites para o workspace ${workspaceId}:`,
      error
    );
    throw new Error("Não foi possível obter os sites do workspace.");
  }

  // A asserção de tipo aqui é segura, pois a queryBuilder acima especifica a seleção de '*, campaigns (count)'.
  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}

/**
 * @async
 * @function getSiteById
 * @description Obtém os dados de um único site a partir do seu ID.
 *              Retorna apenas as informações básicas necessárias para validações de permissão.
 * @param {string} siteId - O ID do site a ser buscado.
 * @returns {Promise<SiteBasicInfo | null>} O objeto do site com informações básicas ou `null` se não for encontrado.
 */
export async function getSiteById(
  siteId: string
): Promise<SiteBasicInfo | null> {
  // <-- CORREÇÃO: Usar o novo tipo SiteBasicInfo
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, subdomain, workspace_id") // Seleciona apenas os campos definidos em SiteBasicInfo
    .eq("id", siteId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = 'Not Found'
      logger.error(
        `[DataLayer:Sites] Erro ao obter o site com ID ${siteId}:`,
        error
      );
    }
    return null;
  }
  return data; // 'data' é corretamente inferido como SiteBasicInfo | null aqui.
}

/**
 * @async
 * @function getSiteDataByHost
 * @description Obtém os dados públicos de um site a partir de um host (subdomínio ou domínio personalizado).
 *              Esta função é otimizada com cache e é ideal para ser usada em middlewares onde o desempenho é crítico.
 * @param {string} host - O host a ser buscado (pode ser um subdomínio ou um domínio personalizado).
 * @returns {Promise<Tables<"sites"> | null>} Os dados do site ou `null` se não for encontrado.
 */
export async function getSiteDataByHost(
  host: string
): Promise<Tables<"sites"> | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  // Nova melhoria: Identificar se é um domínio personalizado para a busca.
  // Assumimos que o rootDomain sempre terá um ponto (e.g., "localhost:3000" ou "meuapp.com").
  const isSubdomain =
    !sanitizedHost.includes(rootDomain.split(":")[0]) ||
    sanitizedHost === rootDomain.split(":")[0];

  const cachedSiteLookup = cache(
    async (hostToSearch: string) => {
      logger.info(`[Cache] MISS: Buscando site para o host: ${hostToSearch}`);
      const supabase = createClient();
      // Refatoração: Adiciona a verificação de domínio personalizado.
      let query = supabase.from("sites").select("*");

      if (isSubdomain) {
        query = query.eq("subdomain", hostToSearch);
      } else {
        query = query.eq("custom_domain", hostToSearch);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `[DataLayer:Sites] Erro no DB ao obter site por host ${hostToSearch}:`,
          error
        );
        return null;
      }
      return data;
    },
    [`site-data-host-${sanitizedHost}`],
    { revalidate: 3600, tags: [`sites:host:${sanitizedHost}`] }
  );

  return await cachedSiteLookup(sanitizedHost);
}

/* Melhorias Futuras Detectadas (Revalidadas e Novas Incrementadas)
 * 1. Busca Multi-campo: Expandir `getSitesByWorkspaceId` para que `searchQuery` possa buscar não apenas por `subdomain`, mas também por `custom_domain` ou até mesmo por nomes de campanhas associadas para maior flexibilidade na UI.
 * 2. Suporte para Ordenação Dinâmica: Modificar `getSitesByWorkspaceId` para aceitar um parâmetro `sort` (e.g., 'name_asc', 'created_at_desc') e aplicá-lo dinamicamente à cláusula `.order()` da consulta Supabase.
 * 3. Função de Atualização (`updateSite`): Criar uma nova função neste aparato para atualizar os detalhes de um site (mudar ícone, domínio personalizado, etc.), incluindo a invalidação de cache (`revalidateTag`) apropriada para manter os dados consistentes.
 * 4. Tratamento de Domínios Personalizados na URL: A lógica `isSubdomain` em `getSiteDataByHost` precisa ser testada rigorosamente para cobrir casos de `localhost` e domínios reais, garantindo que `subdomain` ou `custom_domain` sejam corretamente identificados. (Aprimoramento da lógica isSubdomain para ser mais precisa já implementado).
 */

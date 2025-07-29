// Ruta: scripts/supabase/diagnose-query-integrity.ts (CORREGIDO)
/**
 * @file diagnose-query-integrity.ts
 * @description Aparato de Diagnóstico de Integridad de Consultas.
 *              Misión: Actuar como una prueba de integración para la capa de acceso
 *              a datos (`lib/data`). Ejecuta las funciones de consulta clave y valida
 *              que los datos devueltos se adhieran a los tipos y esquemas definidos,
 *              garantizando el contrato de datos entre el servidor y el cliente.
 * @author L.I.A Legacy
 * @version 1.0.1 (Execution Fix)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { z } from "zod";
import { getSitesByWorkspaceId } from "../../lib/data/sites";
import { getPaginatedCampaignsBySiteId } from "../../lib/data/campaigns";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: "../../.env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
} = process.env;

// --- Esquemas de Zod para la Validación de Contratos ---
const SiteWithCampaignsCountSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  subdomain: z.string().nullable(),
  // Simplificamos para la prueba, asumiendo que las propiedades existen.
  campaigns: z.array(z.object({ count: z.number() })).nonempty(),
});

const CampaignMetadataSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  name: z.string(),
  slug: z.string().nullable(),
});

/**
 * @description Función principal que orquesta las pruebas de integridad de consultas.
 */
async function diagnoseQueryIntegrity() {
  console.log("🚀 [DIAGNÓSTICO DE INTEGRIDAD DE CONSULTAS V1.0] Iniciando...");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están definidas."
    );
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  try {
    console.log(
      "🔬 Obteniendo datos de prueba necesarios (workspace y site)..."
    );
    const { data: workspace, error: wsError } = await supabaseAdmin
      .from("workspaces")
      .select("id")
      .limit(1)
      .single();
    if (wsError || !workspace)
      throw new Error("No se pudo encontrar un workspace para la prueba.");

    const { data: site, error: siteError } = await supabaseAdmin
      .from("sites")
      .select("id")
      .eq("workspace_id", workspace.id)
      .limit(1)
      .single();
    if (siteError || !site)
      throw new Error(
        `No se pudo encontrar un sitio para el workspace ${workspace.id}. Asegúrate de que existen datos de prueba.`
      );

    console.log(
      `✅ Datos de prueba obtenidos: workspaceId=${workspace.id}, siteId=${site.id}`
    );
    console.log("--------------------------------------------------");

    console.log("🔬 Probando el aparato: getSitesByWorkspaceId...");
    const sitesResult = await getSitesByWorkspaceId(workspace.id, {
      page: 1,
      limit: 1,
    });
    const validationSites = z
      .array(SiteWithCampaignsCountSchema)
      .safeParse(sitesResult.sites);

    if (validationSites.success) {
      console.log(
        "   - ✅ [ÉXITO] La forma de los datos es correcta y coincide con el contrato de tipo."
      );
    } else {
      console.error(
        "   - ❌ [FALLO] La forma de los datos NO coincide con el contrato de tipo."
      );
      console.error(
        "     Datos recibidos:",
        JSON.stringify(sitesResult.sites, null, 2)
      );
      console.error(
        "     Detalles del error de validación:",
        validationSites.error.flatten()
      );
    }
    console.log("--------------------------------------------------");

    console.log("🔬 Probando el aparato: getPaginatedCampaignsBySiteId...");
    const campaignsResult = await getPaginatedCampaignsBySiteId(site.id, {
      page: 1,
      limit: 1,
    });
    const validationCampaigns = z
      .array(CampaignMetadataSchema)
      .safeParse(campaignsResult.campaigns);

    if (validationCampaigns.success) {
      console.log(
        "   - ✅ [ÉXITO] La forma de los datos es correcta y coincide con el contrato de tipo."
      );
    } else {
      console.error(
        "   - ❌ [FALLO] La forma de los datos NO coincide con el contrato de tipo."
      );
      console.error(
        "     Datos recibidos:",
        JSON.stringify(campaignsResult.campaigns, null, 2)
      );
      console.error(
        "     Detalles del error de validación:",
        validationCampaigns.error.flatten()
      );
    }
    console.log("--------------------------------------------------");

    if (!validationSites.success || !validationCampaigns.success) {
      throw new Error(
        "Una o más validaciones de integridad de consultas han fallado."
      );
    }
  } catch (e: any) {
    console.error(
      `\n❌ [FALLO] El diagnóstico de integridad ha fallado: ${e.message}`
    );
    process.exit(1);
  }

  console.log(
    "\n✅ [ÉXITO] Todas las consultas de la capa de datos han sido validadas con éxito."
  );
}

// CORRECCIÓN: Se llama a la función correcta.
diagnoseQueryIntegrity();

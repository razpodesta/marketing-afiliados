// scripts/validate-data-layer-types.ts
/**
 * @file validate-data-layer-types.ts
 * @description Aparato de Diagnóstico y Validación de Contratos de Tipos (Estático).
 *              Ha sido corregido para importar el tipo correcto, resolviendo un error
 *              de tipeo.
 * @author L.I.A Legacy
 * @version 2.2.0 (Typo Fix)
 * @usage pnpm test:types
 */
import { admin, sites } from "@/lib/data";
// --- INICIO DE CORRECCIÓN (TS2724) ---
import type {
  CampaignWithSiteInfo,
  UserProfilesWithEmail, // Corregido de UserProfileWithEmail
} from "@/lib/data/admin";
// --- FIN DE CORRECCIÓN ---
import type { SiteWithCampaignsCount } from "@/lib/data/sites";

async function validateContracts() {
  const { sites: siteData }: { sites: SiteWithCampaignsCount[] } =
    await sites.getSitesByWorkspaceId(
      "dummy-workspace-id-for-type-checking",
      {}
    );

  const { profiles }: { profiles: UserProfilesWithEmail[] } =
    await admin.getPaginatedUsersWithRoles({});

  const campaigns: CampaignWithSiteInfo[] =
    await admin.getAllCampaignsWithSiteInfo();

  const __ = { siteData, profiles, campaigns };
}

const _ = validateContracts;

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Corrección de Tipeo**: ((Implementada)) Se ha corregido el nombre del tipo importado de `UserProfileWithEmail` a `UserProfilesWithEmail`, resolviendo el error de compilación `TS2724`.
 */
// scripts/validate-data-layer-types.ts

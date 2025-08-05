// scripts/validate-data-layer-types.ts
/**
 * @file validate-data-layer-types.ts
 * @description Aparato de Diagnóstico y Validación de Contratos de Tipos (Estático).
 *              Este script ha sido refactorizado para ser validado por el compilador de
 *              TypeScript (`tsc --noEmit`), no para ser ejecutado. Su única
 *              responsabilidad es fallar en tiempo de compilación si los contratos de
 *              tipos entre la capa de datos y los tipos definidos no coinciden.
 *
 * @author L.I.A Legacy
 * @version 2.1.0 (Scope Collision Fix)
 * @usage pnpm test:types
 */
import { admin, sites } from "@/lib/data";
import type {
  CampaignWithSiteInfo,
  UserProfileWithEmail,
} from "@/lib/data/admin";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";

/**
 * @function validateContracts
 * @description Esta función existe únicamente para que TypeScript analice su contenido.
 *              Las asignaciones de tipo explícitas son el núcleo de la prueba. Si hay
 *              un desajuste, `tsc` lanzará un error de compilación detallado,
 *              haciendo que el script `pnpm test:types` falle y notifique el problema.
 */
async function validateContracts() {
  // Contrato 1: Validar la forma de los datos de sitios
  const { sites: siteData }: { sites: SiteWithCampaignsCount[] } =
    await sites.getSitesByWorkspaceId(
      "dummy-workspace-id-for-type-checking",
      {}
    );

  // Contrato 2: Validar la forma de los perfiles de usuario
  const { profiles }: { profiles: UserProfileWithEmail[] } =
    await admin.getPaginatedUsersWithRoles({});

  // Contrato 3: Validar la forma de las campañas
  const campaigns: CampaignWithSiteInfo[] =
    await admin.getAllCampaignsWithSiteInfo();

  // --- INICIO DE CORRECCIÓN (TS2588) ---
  // El propósito de esta asignación es evitar el error "unused variable".
  // Se declara una nueva constante local `__` para no colisionar con la
  // constante `_` del ámbito del módulo.
  const __ = { siteData, profiles, campaigns };
  // --- FIN DE CORRECCIÓN ---
}

// Variable para evitar el error "unused function". La función no se llama.
const _ = validateContracts;

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Resolución de Conflicto de Alcance (TS2588)**: ((Implementada)) Se ha corregido la reasignación ilegal de una constante declarando una nueva variable local, resolviendo el error de compilación.
 * 2. **Análisis Estático Puro**: ((Vigente)) El script ya no contiene lógica de ejecución, eliminando el error de contexto de `cookies()`. Ahora utiliza `tsc` para una validación de tipos estática, rápida y correcta.
 *
 * @subsection Melhorias Futuras
 * 1. **Descubrimiento Automático de Contratos**: ((Vigente)) El script podría ser mejorado para leer todos los archivos en `lib/data` y `lib/types` para descubrir y validar automáticamente todos los contratos de datos exportados.
 */
// scripts/validate-data-layer-types.ts

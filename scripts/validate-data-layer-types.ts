// scripts/validate-data-layer-types.ts

/**
 * @file validate-data-layer-types.ts
 * @description Prueba de contrato de tipos. Verifica estáticamente (en tiempo de compilación)
 *              que la forma de los datos devueltos por la capa de datos coincide con
 *              el tipo `SiteWithCampaignsCount` exportado. La ejecución exitosa de este
 *              script (sin errores de TypeScript) valida el contrato de datos.
 * @author L.I.A Legacy
 * @version 2.0.0 (Integrity Restored)
 */
import { sites } from "@/lib/data";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";

async function validateTypeContract() {
  console.log("VALIDANDO CONTRATO DE DATOS: `SiteWithCampaignsCount`...");

  // Esta asignación de tipo explícita es el núcleo de la prueba.
  // Si hay un desajuste entre el tipo `SiteWithCampaignsCount` y lo que
  // realmente devuelve `getSitesByWorkspaceId`, el compilador de TypeScript
  // lanzará un error aquí, haciendo que el script falle.
  const { sites: siteData }: { sites: SiteWithCampaignsCount[] } =
    await sites.getSitesByWorkspaceId(
      "dummy-workspace-id-for-type-checking",
      {}
    );

  // Si la línea anterior compila sin errores, el contrato se cumple.
  console.log("✅ El tipo `SiteWithCampaignsCount` se resuelve correctamente.");
}

validateTypeContract().catch((error) => {
  console.error("❌ Falló la validación del contrato de datos:", error);
  process.exit(1);
});

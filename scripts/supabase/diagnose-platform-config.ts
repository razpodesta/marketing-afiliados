// Ruta: scripts/supabase/diagnose-platform-config.ts
/**
 * @file diagnose-platform-config.ts
 * @description Aparato de Auditoría de Configuración de la Plataforma Supabase.
 *              Utiliza la API de gestión de Supabase para verificar la configuración
 *              crítica del proyecto, como URLs, proveedores de OAuth y políticas de email.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 2.1.0 (Native Fetch API Refactor)
 */
import dotenv from "dotenv";

// Carga las variables de entorno desde la raíz del proyecto.
dotenv.config({ path: ".env.local" });

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN } = process.env;
const API_VERSION = "v1";

// Contrato de datos: define la estructura que esperamos de la API de Supabase.
type SupabaseAuthConfig = {
  SITE_URL: string;
  DISABLE_SIGNUP: boolean;
  MAILER_AUTOCONFIRM: boolean;
  EXTERNAL_PROVIDERS: Record<
    string,
    {
      enabled: boolean;
      client_id: string | null;
      secret: string | null;
    }
  >;
  URI_ALLOW_LIST: string[] | null;
};

/**
 * @async
 * @function diagnosePlatformConfig
 * @description Orquesta la auditoría de configuración de la plataforma.
 */
async function diagnosePlatformConfig() {
  console.log(
    "🚀 [AUDITORÍA DE CONFIGURACIÓN DE PLATAFORMA V2.1] Iniciando..."
  );
  console.log("--------------------------------------------------");

  if (
    !NEXT_PUBLIC_SUPABASE_URL ||
    !SUPABASE_ACCESS_TOKEN ||
    SUPABASE_ACCESS_TOKEN === "tu_nuevo_token_de_acceso_personal_aqui"
  ) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están configuradas en .env.local"
    );
    process.exit(1);
  }

  const projectIdMatch = NEXT_PUBLIC_SUPABASE_URL.match(/https?:\/\/([^.]+)/);
  if (!projectIdMatch || !projectIdMatch[1]) {
    console.error(
      "❌ ERROR: No se pudo extraer el ID del proyecto desde NEXT_PUBLIC_SUPABASE_URL."
    );
    process.exit(1);
  }
  const projectId = projectIdMatch[1];
  console.log(
    `🔬 Realizando auditoría para el proyecto de Supabase con ID: ${projectId}`
  );

  try {
    // REFACTORIZACIÓN: Se elimina la dependencia 'node-fetch' y se utiliza
    // la API `fetch` global y nativa, disponible en Node.js v18+.
    const response = await fetch(
      `https://api.supabase.com/${API_VERSION}/projects/${projectId}/auth/config`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      console.error(
        "❌ ERROR DE AUTENTICACIÓN (401): Tu SUPABASE_ACCESS_TOKEN es inválido o ha expirado."
      );
      throw new Error("Token de acceso inválido.");
    }
    if (!response.ok) {
      const errorData: unknown = await response.json();
      console.error(
        `❌ ERROR al obtener la configuración (Status: ${response.status}):`,
        JSON.stringify(errorData, null, 2)
      );
      throw new Error("Fallo en la llamada a la Management API.");
    }

    const config = (await response.json()) as SupabaseAuthConfig;

    console.log("✅ Configuración de la plataforma obtenida con éxito.");
    console.log("\n--- 📝 INFORME DE CONFIGURACIÓN DE AUTENTICACIÓN ---");

    console.log("\n[ General ]");
    console.table({
      SITE_URL: {
        Value: config.SITE_URL,
        Estado: config.SITE_URL ? "✅ OK" : "❌ CRÍTICO",
      },
      DISABLE_SIGNUP: {
        Value: config.DISABLE_SIGNUP,
        Estado: config.DISABLE_SIGNUP ? "🟡 Advertencia" : "✅ OK",
      },
      MAILER_AUTOCONFIRM: {
        Value: config.MAILER_AUTOCONFIRM,
        Estado: config.MAILER_AUTOCONFIRM
          ? "🟡 Advertencia de Seguridad"
          : "✅ OK",
      },
    });
    if (!config.SITE_URL)
      console.error(
        "   -> CRÍTICO: SITE_URL no está configurado. La autenticación fallará."
      );
    if (config.MAILER_AUTOCONFIRM)
      console.warn(
        "   -> ADVERTENCIA: La confirmación automática de email está activada."
      );

    console.log("\n[ Proveedores Externos (OAuth) ]");
    const providers = Object.entries(config.EXTERNAL_PROVIDERS)
      .filter(([, value]) => value.enabled)
      .map(([key, value]) => ({
        Proveedor: key.toUpperCase(),
        Habilitado: value.enabled ? "✅ Sí" : "No",
        "Client ID Configurado": value.client_id ? "✅ Sí" : "❌ No",
        "Secreto Configurado": value.secret ? "✅ Sí" : "❌ No",
      }));
    if (providers.length > 0) {
      console.table(providers);
    } else {
      console.info(
        "   - No hay proveedores de OAuth habilitados en esta plataforma."
      );
    }
    console.log("--------------------------------------------------");
  } catch (e: any) {
    console.error(
      `\n❌ [FALLO] La auditoría de configuración ha fallado: ${e.message}`
    );
    process.exit(1);
  }

  console.log(
    "\n✅ [ÉXITO] La auditoría de configuración de la plataforma ha finalizado."
  );
}

diagnosePlatformConfig();
// Ruta: scripts/supabase/diagnose-platform-config.ts

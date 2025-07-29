// Ruta: scripts/supabase/diagnose-platform-config.ts (CORREGIDO)
/**
 * @file diagnose-platform-config.ts
 * @description Aparato de Auditoría de Configuración de la Plataforma Supabase.
 * @author L.I.A Legacy
 * @version 2.0.1 (Type Safety & Execution Fix)
 */

import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: "../../.env.local" });

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN } = process.env;
const API_VERSION = "v1";

// CORRECCIÓN: Se define un tipo para la respuesta esperada de la API.
// Este es el "contrato de datos" que esperamos que Supabase cumpla.
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

async function diagnosePlatformConfig() {
  console.log(
    "🚀 [AUDITORÍA DE CONFIGURACIÓN DE PLATAFORMA V2.0] Iniciando..."
  );
  console.log("--------------------------------------------------");

  if (
    !NEXT_PUBLIC_SUPABASE_URL ||
    !SUPABASE_ACCESS_TOKEN ||
    SUPABASE_ACCESS_TOKEN === "tu_nuevo_token_de_acceso_personal_aqui"
  ) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están configuradas."
    );
    process.exit(1);
  }

  const projectId = NEXT_PUBLIC_SUPABASE_URL.split(".")[0].replace(
    "https://",
    ""
  );
  console.log(
    `🔬 Realizando auditoría para el proyecto de Supabase con ID: ${projectId}`
  );

  try {
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
      const errorData = await response.json();
      console.error(
        `❌ ERROR al obtener la configuración (Status: ${response.status}):`,
        JSON.stringify(errorData, null, 2)
      );
      throw new Error("Fallo en la llamada a la Management API.");
    }

    // CORRECCIÓN: Se realiza una aserción de tipo para informar a TypeScript
    // que confiamos en que los datos recibidos tienen la forma de 'SupabaseAuthConfig'.
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

    console.log("\n[ URLs de Redirección y Lista Blanca ]");
    if (config.URI_ALLOW_LIST && config.URI_ALLOW_LIST.length > 0) {
      console.log("   - URIs en la lista blanca:");
      config.URI_ALLOW_LIST.forEach((uri: string) =>
        console.log(`     - ${uri}`)
      );
      if (!config.URI_ALLOW_LIST.includes(process.env.NEXT_PUBLIC_SITE_URL!)) {
        console.warn(
          `   - 🟡 ADVERTENCIA: La URL de tu sitio local (${process.env.NEXT_PUBLIC_SITE_URL}) no está en la lista blanca.`
        );
      }
    } else {
      console.warn("   - 🟡 ADVERTENCIA: La lista blanca de URIs está vacía.");
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

// CORRECCIÓN: Se llama a la función correcta.
diagnosePlatformConfig();

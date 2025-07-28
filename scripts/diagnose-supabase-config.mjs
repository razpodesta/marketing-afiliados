// Ruta: scripts/diagnose-supabase-config.mjs
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

/**
 * @file diagnose-supabase-config.mjs
 * @description Script de diagnóstico que utiliza la Management API de Supabase
 * para verificar la configuración de autenticación del proyecto.
 * @author L.I.A Legacy
 * @version 1.1.0
 */
async function diagnoseSupabaseConfig() {
  console.log("🚀 Iniciando diagnóstico de configuración de Supabase...");

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0].replace(
    "https://",
    ""
  );
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!projectId) {
    console.error(
      "❌ ERROR: No se pudo extraer el ID del proyecto desde NEXT_PUBLIC_SUPABASE_URL."
    );
    return;
  }

  if (
    !accessToken ||
    accessToken === "tu_nuevo_token_de_acceso_personal_aqui"
  ) {
    console.error(
      "❌ ERROR: La variable de entorno SUPABASE_ACCESS_TOKEN no está definida en .env.local."
    );
    console.info(
      "   Puedes generar uno en: https://supabase.com/dashboard/account/tokens"
    );
    return;
  }

  console.log(`   - Diagnóstico para el proyecto: ${projectId}`);

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/auth/config`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `❌ ERROR al obtener la configuración de Supabase (Status: ${response.status}):`
      );
      console.error(JSON.stringify(errorData, null, 2));
      return;
    }

    const config = await response.json();

    console.log("\n✅ Configuración de Autenticación obtenida con éxito:\n");
    console.log("--- RESUMEN GENERAL ---");
    console.table({
      "Sitio URL": config.SITE_URL,
      "Deshabilitar Registro": config.DISABLE_SIGNUP,
      "Confirmación Automática de Email": !config.MAILER_AUTOCONFIRM,
      "Email de Soporte": config.MAILER_SENDER_NAME,
    });

    console.log("\n--- PROVEEDORES OAUTH ---");
    const providers = Object.entries(config.EXTERNAL_PROVIDERS)
      .filter(([, value]) => value.enabled)
      .map(([key, value]) => ({
        Proveedor: key.toUpperCase(),
        Habilitado: value.enabled,
        "Client ID": value.client_id ? "Configurado" : "NO CONFIGURADO",
        Secreto: value.secret ? "Configurado" : "NO CONFIGURADO",
      }));

    if (providers.length > 0) {
      console.table(providers);
    } else {
      console.warn("   - No hay proveedores de OAuth habilitados.");
    }

    console.log("\n--- URLs DE REDIRECCIÓN ---");
    if (config.URI_ALLOW_LIST && config.URI_ALLOW_LIST.length > 0) {
      console.log("   - Lista de URIs permitidas (URI_ALLOW_LIST):");
      config.URI_ALLOW_LIST.forEach((uri) => console.log(`     - ${uri}`));
    } else {
      console.warn(
        "   - ¡ADVERTENCIA! No hay URIs en la lista blanca. Esto puede causar problemas de redirección en OAuth."
      );
    }
    console.log("\nDiagnóstico completado.");
  } catch (error) {
    console.error("❌ Ocurrió un error inesperado:", error);
  }
}

diagnoseSupabaseConfig();

// Ruta: scripts/supabase/diagnose-data-integrity.ts (NUEVO Y REFACTORIZADO)
/**
 * @file diagnose-data-integrity.ts
 * @description Aparato de Diagnóstico de Integridad de Datos.
 *              Misión: Ejecutar una serie de comprobaciones (vía funciones RPC)
 *              para detectar inconsistencias y "datos huérfanos" en la base de datos,
 *              como usuarios sin perfiles, workspaces sin propietarios, etc.
 * @author L.I.A Legacy
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
} = process.env;

const SQL_FOR_RPC_FUNCTIONS = `
-- Comprueba si existen usuarios en 'auth.users' que no tienen una entrada correspondiente en 'public.profiles'
CREATE OR REPLACE FUNCTION users_without_profiles_check()
RETURNS INT AS $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT count(*)
    INTO orphan_count
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    RETURN orphan_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comprueba si existen workspaces cuyo 'owner_id' no corresponde a ningún perfil existente.
CREATE OR REPLACE FUNCTION workspaces_without_owners_check()
RETURNS INT AS $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT count(*)
    INTO orphan_count
    FROM public.workspaces w
    LEFT JOIN public.profiles p ON w.owner_id = p.id
    WHERE p.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agrega aquí futuras funciones de comprobación de integridad...
`;

type Check = {
  description: string;
  rpcName: string;
  successMessage: string;
  failureMessage: string;
};

const INTEGRITY_CHECKS: Check[] = [
  {
    description: "Verificando usuarios sin perfiles (huérfanos)...",
    rpcName: "users_without_profiles_check",
    successMessage: "Todos los usuarios tienen un perfil asociado.",
    failureMessage:
      "Se detectaron usuarios sin perfiles. ¡Esto es una inconsistencia crítica!",
  },
  {
    description: "Verificando workspaces sin propietarios (huérfanos)...",
    rpcName: "workspaces_without_owners_check",
    successMessage: "Todos los workspaces tienen un propietario válido.",
    failureMessage:
      "Se detectaron workspaces sin propietario. ¡Integridad de datos comprometida!",
  },
];

async function diagnoseDataIntegrity() {
  console.log("🚀 [DIAGNÓSTICO DE INTEGRIDAD DE DATOS V1.0] Iniciando...");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están definidas."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  let overallSuccess = true;

  for (const check of INTEGRITY_CHECKS) {
    console.log(`🔬 ${check.description}`);
    try {
      const { data, error } = await supabase.rpc(check.rpcName);

      if (error) {
        if (error.code === "42883") {
          console.error(
            `   - ❌ ERROR DE DEPENDENCIA: La función RPC '${check.rpcName}' no se encontró.`
          );
          console.info(
            "\n🛠️ ACCIÓN REQUERIDA: Corre el script SQL completo en tu editor de Supabase para crear todas las funciones de diagnóstico necesarias."
          );
          console.log("\n-- INICIO DEL SCRIPT SQL DE INTEGRIDAD --");
          console.log(SQL_FOR_RPC_FUNCTIONS);
          console.log("-- FIN DEL SCRIPT SQL DE INTEGRIDAD --\n");
        } else {
          console.error(`   - ❌ ERROR RPC: ${error.message}`);
        }
        overallSuccess = false;
        continue;
      }

      if (data > 0) {
        console.error(
          `   - ❌ FALLÓ: ${check.failureMessage} (Total: ${data})`
        );
        overallSuccess = false;
      } else {
        console.log(`   - ✅ PASÓ: ${check.successMessage}`);
      }
    } catch (e: any) {
      console.error(
        `   - ❌ FALLO CATASTRÓFICO al ejecutar la comprobación: ${e.message}`
      );
      overallSuccess = false;
    }
  }

  console.log("--------------------------------------------------");
  if (overallSuccess) {
    console.log(
      "\n✅ [ÉXITO] La auditoría de integridad de datos ha finalizado sin encontrar inconsistencias."
    );
  } else {
    console.error(
      "\n❌ [FALLO] La auditoría de integridad de datos ha detectado problemas críticos."
    );
    process.exit(1);
  }
}

diagnoseDataIntegrity();

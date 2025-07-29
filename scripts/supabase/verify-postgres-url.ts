// Ruta: scripts/supabase/verify-postgres-url.ts (NUEVO)
/**
 * @file verify-postgres-url.ts
 * @description Aparato de diagnóstico para verificar la conexión directa a la base de datos
 *              PostgreSQL usando la cadena de conexión.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

async function verifyPostgresUrl() {
  console.log("🔬 Verificando POSTGRES_URL (conexión directa a la BBDD)...");
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    console.error(
      "❌ ERROR: La variable POSTGRES_URL no se encontró en .env.local"
    );
    return process.exit(1);
  }

  const client = new Client({ connectionString: POSTGRES_URL });

  try {
    await client.connect();
    // La consulta más simple para verificar la conexión.
    await client.query("SELECT 1");
    console.log(
      "✅ [ÉXITO] La conexión directa a la base de datos con POSTGRES_URL es exitosa."
    );
  } catch (e: any) {
    console.error(
      `❌ [FALLO] No se pudo conectar a la base de datos: ${e.message}`
    );
    process.exit(1);
  } finally {
    await client.end();
  }
}
verifyPostgresUrl();

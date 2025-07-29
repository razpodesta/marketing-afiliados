// Ruta: scripts/supabase/verify-postgres-url.ts
/**
 * @file verify-postgres-url.ts
 * @description Aparato de diagnóstico de nivel de infraestructura. Su única misión es
 *              verificar la validez y conectividad de la cadena de conexión directa
 *              a la base de datos PostgreSQL (`POSTGRES_URL`), que es utilizada
 *              por herramientas como Prisma o Drizzle para migraciones.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 1.1.0 (Dependency Fix & Code Refinement)
 */
import dotenv from "dotenv";
import { Client } from "pg";

// Carga las variables de entorno desde la raíz del proyecto.
dotenv.config({ path: ".env.local" });

/**
 * @async
 * @function verifyPostgresUrl
 * @description Orquesta la prueba de conexión directa a PostgreSQL.
 */
async function verifyPostgresUrl() {
  console.log("🔬 Verificando POSTGRES_URL (conexión directa a la BBDD)...");
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    console.error(
      "❌ ERROR: La variable de entorno POSTGRES_URL no se encontró en .env.local"
    );
    return process.exit(1);
  }

  const client = new Client({ connectionString: POSTGRES_URL });

  try {
    await client.connect();
    // La consulta más simple y universal para verificar una conexión a PostgreSQL.
    await client.query("SELECT 1");
    console.log(
      "✅ [ÉXITO] La conexión directa a la base de datos con POSTGRES_URL es exitosa."
    );
  } catch (e: any) {
    console.error(
      `❌ [FALLO] No se pudo conectar a la base de datos: ${
        e.message || "Error desconocido"
      }`
    );
    process.exit(1);
  } finally {
    // Es crucial cerrar la conexión, incluso si falla, para liberar recursos.
    await client.end();
  }
}

verifyPostgresUrl();
// Ruta: scripts/supabase/verify-postgres-url.ts

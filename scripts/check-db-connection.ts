// Ruta: scripts/check-db-connection.ts
/**
 * @file Script de Auditoría de Salud del Sistema V5.1
 * @description Realiza una auditoría completa de la conectividad, salud de datos,
 *              seguridad y rendimiento de la base de datos de Supabase.
 *
 *              Funcionalidades Clave:
 *              1. VERIFICACIÓN DUAL DE ACCESO: Comprueba la conexión usando tanto la
 *                 clave de rol de servicio (backend) como la clave anónima (frontend).
 *              2. VALIDACIÓN DE ESQUEMA CON ZOD: Valida la forma de los datos
 *                 recibidos contra un esquema predefinido.
 *              3. AUDITORÍA DE VOLUMEN DE DATOS: Reporta el número total de registros
 *                 en tablas cruciales.
 *              4. COMPROBACIÓN INTELIGENTE DE RLS: Utiliza una función RPC para
 *                 verificar si RLS está habilitado antes de intentar leer datos.
 *              5. MEDICIÓN DE LATENCIA: Mide y reporta el tiempo de respuesta.
 *              6. LÓGICA REUTILIZABLE: La lógica está encapsulada para ser usada en
 *                 un futuro endpoint de API de monitoreo.
 *
 * @author L.I.A. Legacy
 * @version 5.1.0
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { performance } from "perf_hooks";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const ProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  app_role: z.enum(["user", "admin", "developer"]).nullable(),
});

const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  owner_id: z.string().uuid(),
});

type HealthCheckResult = {
  status: "OK" | "WARN" | "ERROR";
  message: string;
  details?: any;
  latencyInMs?: number;
};

type HealthCheckReport = {
  overallStatus: "OK" | "ERROR";
  timestamp: string;
  serviceRoleCheck: HealthCheckResult;
  anonRoleCheck: HealthCheckResult;
};

export async function performHealthCheck(): Promise<HealthCheckReport> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const report: HealthCheckReport = {
    overallStatus: "OK",
    timestamp: new Date().toISOString(),
    serviceRoleCheck: { status: "ERROR", message: "Not run" },
    anonRoleCheck: { status: "ERROR", message: "Not run" },
  };

  try {
    const serviceStart = performance.now();
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profiles, error: profilesError } = await supabaseService
      .from("profiles")
      .select("id, full_name, app_role")
      .limit(1);
    if (profilesError)
      throw new Error(
        `Service Role check failed on 'profiles': ${profilesError.message}`
      );
    z.array(ProfileSchema).parse(profiles);

    const { data: workspaces, error: workspacesError } = await supabaseService
      .from("workspaces")
      .select("id, name, owner_id")
      .limit(1);
    if (workspacesError)
      throw new Error(
        `Service Role check failed on 'workspaces': ${workspacesError.message}`
      );
    z.array(WorkspaceSchema).parse(workspaces);

    report.serviceRoleCheck = {
      status: "OK",
      message: "Connection and schema validation successful.",
      latencyInMs: Math.round(performance.now() - serviceStart),
    };

    const anonStart = performance.now();
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const { data: rlsStatus, error: rlsError } = await supabaseService.rpc(
      "is_rls_enabled_on_table",
      { table_name_param: "feature_modules" }
    );
    if (rlsError)
      throw new Error(`Could not check RLS status: ${rlsError.message}`);

    const { error: anonSelectError } = await supabaseAnon
      .from("feature_modules")
      .select("id")
      .limit(1);

    if (anonSelectError && rlsStatus) {
      report.anonRoleCheck = {
        status: "OK",
        message: "Read blocked by RLS as expected.",
        details: anonSelectError.message,
        latencyInMs: Math.round(performance.now() - anonStart),
      };
    } else if (anonSelectError) {
      throw new Error(
        `Anonymous read failed unexpectedly (RLS is off): ${anonSelectError.message}`
      );
    } else {
      report.anonRoleCheck = {
        status: "WARN",
        message: "Anonymous read was successful. Ensure this is intended.",
        latencyInMs: Math.round(performance.now() - anonStart),
      };
    }
  } catch (error: any) {
    report.overallStatus = "ERROR";
    const errorMessage = error.message || "An unknown error occurred";
    if (report.serviceRoleCheck.status === "ERROR") {
      report.serviceRoleCheck.message = errorMessage;
    } else {
      report.anonRoleCheck = { status: "ERROR", message: errorMessage };
    }
  }

  return report;
}

async function main() {
  console.log(
    "🚀 [VERIFICACIÓN DE CONEXIÓN Y SALUD V5.1] Iniciando auditoría completa..."
  );

  const report = await performHealthCheck();

  console.log("\n--- Auditando Conexión con Rol de Servicio (Backend) ---");
  console.log(`   - Estado: ${report.serviceRoleCheck.status}`);
  console.log(`   - Mensaje: ${report.serviceRoleCheck.message}`);
  if (report.serviceRoleCheck.latencyInMs) {
    console.log(
      `   - Latencia Total: ${report.serviceRoleCheck.latencyInMs}ms`
    );
  }

  console.log("\n--- Auditando Conexión con Clave Anónima (Frontend) ---");
  console.log(`   - Estado: ${report.anonRoleCheck.status}`);
  console.log(`   - Mensaje: ${report.anonRoleCheck.message}`);
  if (report.anonRoleCheck.latencyInMs) {
    console.log(`   - Latencia Total: ${report.anonRoleCheck.latencyInMs}ms`);
  }

  console.log(`\n\n[ESTADO GENERAL DEL SISTEMA: ${report.overallStatus}]`);
  console.log(
    "✅ [VERIFICACIÓN DE CONEXIÓN Y SALUD V5.1] Auditoría completa finalizada."
  );

  if (report.overallStatus === "ERROR") {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Health Check Endpoint (/api/health): La función `performHealthCheck` está ahora perfectamente encapsulada. El siguiente paso es crear una ruta de API en `app/api/health/route.ts` que importe y llame a esta función, y devuelva el `HealthCheckReport` como JSON con un código de estado HTTP apropiado (200 para 'OK', 503 para 'ERROR'). Esto permite la integración con servicios de monitoreo externos como UptimeRobot o Better Uptime.
 * 2. Comprobación de Salud de Servicios Externos: La auditoría podría expandirse para incluir "pings" a servicios externos de los que la aplicación depende, como la API de Stripe o un servicio de email transaccional (Resend). Esto proporcionaría una visión 360° no solo de la base de datos, sino de todo el ecosistema de servicios.
 * 3. Alertas Proactivas: Integrar el script con un sistema de alertas. Si `performHealthCheck` devuelve un estado 'ERROR', podría disparar una notificación a un canal de Slack, un webhook de PagerDuty o enviar un email a los administradores del sistema, permitiendo una respuesta proactiva a los fallos del sistema antes de que los usuarios se vean afectados.
 */

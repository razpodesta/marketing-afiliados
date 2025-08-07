// lib/routing-manifest.ts
/**
 * @file routing-manifest.ts
 * @description Manifiesto de Seguridad Declarativo. Esta es la Única Fuente de Verdad
 *              para todas las reglas de seguridad de enrutamiento de la aplicación.
 * @author L.I.A Legacy
 * @version 2.0.0 (Canonical Implementation)
 */
import type { Database } from "@/lib/types/database";

type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * @description Define la clasificación de seguridad para una ruta.
 * - `public`: Accesible por todos.
 * - `auth`: Solo accesible por usuarios NO autenticados (ej. /login).
 * - `protected`: Requiere una sesión de usuario válida.
 */
export type RouteClassification = "public" | "auth" | "protected";

/**
 * @description Define el contrato para una regla de seguridad de ruta.
 */
export interface RouteSecurityRule {
  /** La ruta base a la que aplica la regla (coincide con `startsWith`). */
  path: string;
  /** La clasificación de seguridad de la ruta. */
  classification: RouteClassification;
  /** Un array opcional de roles de aplicación requeridos para el acceso. */
  requiredRoles?: AppRole[];
}

/**
 * @description La configuración canónica de todas las reglas de seguridad.
 *              Las rutas más específicas deben ir primero para garantizar una correcta coincidencia.
 */
export const ROUTE_MANIFEST: RouteSecurityRule[] = [
  // Rutas más específicas primero
  {
    path: "/dev-console",
    classification: "protected",
    requiredRoles: ["developer"],
  },
  {
    path: "/admin",
    classification: "protected",
    requiredRoles: ["admin", "developer"],
  },
  { path: "/dashboard", classification: "protected" },
  { path: "/builder", classification: "protected" },
  { path: "/welcome", classification: "protected" },
  { path: "/auth/login", classification: "auth" },
  { path: "/auth/signup", classification: "auth" },
  { path: "/forgot-password", classification: "auth" },
  { path: "/reset-password", classification: "auth" },
  // Rutas públicas al final
  { path: "/", classification: "public" },
];

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Implementación Canónica**: ((Implementada)) Se ha restaurado el contenido correcto del archivo, cumpliendo su objetivo global como manifiesto declarativo.
 * 2. **Documentación TSDoc Verbosa**: ((Implementada)) Se ha documentado cada tipo y constante para una máxima claridad y mantenibilidad.
 *
 * @subsection Melhorias Futuras
 * 1. **Carga desde Base de Datos**: ((Vigente)) Para una gestión dinámica sin redespliegues, este manifiesto podría cargarse desde una tabla de configuración en la base de datos.
 */
// lib/routing-manifest.ts

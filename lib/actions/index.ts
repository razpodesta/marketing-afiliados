// lib/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Este archivo exporta todas las Server Actions del proyecto, agrupadas
 *              por namespaces de dominio para una máxima organización y claridad.
 *
 * @version 4.0.0 (Architectural Warning & Auto-Generation)
 * @author Metashark
 *
 * @warning_architectural **USO EXCLUSIVO DEL SERVIDOR**: Este archivo no debe ser
 *                       importado directamente en Componentes de Cliente ("use client").
 *                       Hacerlo puede introducir dependencias de servidor no deseadas
 *                       y causar errores de compilación. Importe las acciones
 *                       individuales desde sus archivos de origen (ej. `from "@/lib/actions/sites.actions"`).
 *
 * @example
 * // USO CORRECTO (en un Server Component o en otra Server Action):
 * import { sites, workspaces } from "@/lib/actions";
 * const allSites = await sites.getAllSites();
 */
export * as admin from "./admin.actions";
export * as auth from "./auth.actions";
export * as builder from "./builder.actions";
export * as campaigns from "./campaigns.actions";
export * as password from "./password.actions";
export * as profiles from "./profiles.actions";
export * as session from "./session.actions";
export * as sites from "./sites.actions";
export * as telemetry from "./telemetry.actions";
export * as workspaces from "./workspaces.actions";
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Blindaje Arquitectónico**: ((Implementada)) Se ha añadido una advertencia TSDoc de alto nivel para guiar a los desarrolladores sobre el uso correcto de este archivo, previniendo futuras violaciones del límite Servidor-Cliente.
 *
 * @subsection Melhorias Futuras
 * 1.  **Validación con ESLint**: ((Vigente)) Se podría crear una regla de ESLint personalizada que prohíba la importación de `lib/actions` en cualquier archivo que contenga la directiva `"use client"`.
 */
// lib/actions/index.ts

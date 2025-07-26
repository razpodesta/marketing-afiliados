// Ruta: lib/data/sites.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/database.types";
import { logger } from "@/lib/logging";

/**
 * @file sites.ts
 * @description Capa de Acceso a Datos para la entidad 'sites'.
 * CORREGIDO: Se ha refactorizado el archivo para que cada función cree su propia
 * instancia del cliente de Supabase llamando a `createClient()`, en lugar de
 * depender de una importación incorrecta. Esto resuelve el error de compilación.
 *
 * @author Metashark
 * @version 2.0.0 (Corrected Supabase Client Instantiation)
 */
export type Site = Database["public"]["Tables"]["sites"]["Row"];

/**
 * @description Obtiene los datos de un sitio específico a partir de su subdominio.
 */
export async function getSiteDataBySubdomain(
  subdomain: string
): Promise<Site | null> {
  const supabase = createClient();
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("subdomain", sanitizedSubdomain)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116: 'single' row not found, which is okay.
    logger.error(`Error al obtener datos del sitio para ${subdomain}:`, error);
    return null;
  }

  return data;
}

/**
 * @description Obtiene todos los sitios de la plataforma (solo para administradores).
 */
export async function getAllSites(): Promise<Site[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error al obtener todos los sitios:", error);
    return [];
  }
  return data;
}

/**
 * @description Obtiene todos los sitios que pertenecen a un workspace específico.
 */
export async function getSitesByWorkspaceId(
  workspaceId: string
): Promise<Site[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      `Error al obtener sitios para el workspace ${workspaceId}:`,
      error
    );
    return [];
  }
  return data;
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`.
2.  **Paginación:** Refactorizar `getAllSites` y `getSitesByWorkspaceId` para que acepten argumentos de paginación.
3.  **Seguridad a Nivel de Aplicación:** Aunque las RLS protegen los datos en la BD, las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain` para reducir la carga sobre la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Aplicación:** Las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`, ya que será llamada en cada petición a un subdominio. Esto reducirá drásticamente la carga de la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Aplicación:** Aunque RLS protege los datos, las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`, ya que será llamada en cada petición a un subdominio. Esto reducirá drásticamente la carga de la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Workspace:** Aunque RLS protege los datos, las funciones de acceso a datos podrían tomar el ID del workspace activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad a nivel de aplicación.
 */

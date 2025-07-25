// lib/platform/tenants.ts
/**
 * @file Tenant Data Access Layer
 * @description Este módulo encapsula toda la lógica de acceso a datos para la entidad 'tenants'.
 * Actúa como una capa de abstracción entre las Server Actions/páginas y la base de datos (Supabase),
 * permitiendo cambiar la implementación de la base de datos en el futuro modificando solo este archivo.
 *
 * @author Metashark
 * @version 1.1.0 (Added owner-specific fetching)
 */

import { supabase } from "@/lib/supabase/server";

/**
 * @typedef {object} Tenant
 * @description Define la estructura de un objeto Tenant tal como se recupera de la base de datos
 * y se utiliza en toda la aplicación.
 * @property {string} subdomain - El subdominio único del tenant.
 * @property {string} icon - El emoji asociado al tenant.
 * @property {string} created_at - La fecha de creación en formato ISO 8601.
 */
export type Tenant = {
  subdomain: string;
  icon: string;
  created_at: string;
};

/**
 * @description Obtiene los datos de un tenant específico a partir de su subdominio.
 * Es utilizado principalmente por el middleware para el enrutamiento.
 * @param {string} subdomain - El subdominio a buscar, que será sanitizado.
 * @returns {Promise<Tenant | null>} Un objeto con los datos del tenant si se encuentra, de lo contrario `null`.
 */
export async function getTenantDataBySubdomain(
  subdomain: string
): Promise<Tenant | null> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const { data, error } = await supabase
    .from("tenants")
    .select("subdomain, icon, created_at")
    .eq("subdomain", sanitizedSubdomain)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es el código para "0 rows found", lo cual no es un error que debamos loguear, es un resultado esperado.
    console.error(`[getTenantDataBySubdomain] Error fetching tenant:`, error);
    return null;
  }

  return data;
}

/**
 * @description Obtiene una lista de todos los tenants registrados en la plataforma.
 * Esta función es para uso exclusivo del panel de administración (roles 'developer' o 'admin').
 * @returns {Promise<Tenant[]>} Un array de todos los objetos Tenant.
 */
export async function getAllTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from("tenants")
    .select("subdomain, icon, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllTenants] Error fetching all tenants:", error);
    return [];
  }

  return data;
}

/**
 * @description Obtiene todos los tenants que pertenecen a un usuario específico.
 * Esta función es la que utilizará el dashboard del suscriptor.
 * @param {string} ownerId - El UUID del propietario de los tenants.
 * @returns {Promise<Tenant[]>} Un array de los tenants del usuario.
 */
export async function getTenantsByOwner(ownerId: string): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from("tenants")
    .select("subdomain, icon, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `[getTenantsByOwner] Error fetching tenants for owner ${ownerId}:`,
      error
    );
    return [];
  }

  return data;
}

/* MEJORAS PROPUESTAS
 * 1. **Capa de Caché:** Para la función `getTenantDataBySubdomain`, que será llamada frecuentemente por el middleware, implementar una capa de caché (por ejemplo, con Redis o la caché en memoria de Next.js) podría reducir drásticamente la carga sobre la base de datos y mejorar la latencia.
 * 2. **Paginación para `getAllTenants`:** Si la plataforma crece, esta función será ineficiente. Debería ser refactorizada para aceptar argumentos de `page` y `pageSize` y usar los métodos `.range()` de Supabase para implementar la paginación.
 * 3. **Proyecciones de Datos Selectivas:** En lugar de `select("*")` o `select("col1, col2, ...")`, se podría pasar el `select` string como argumento a las funciones. Esto permitiría a cada llamador pedir solo los datos que necesita, optimizando el tamaño de la respuesta de la base de datos.
 * 1. **Capa de Caché:** Para la función `getTenantDataBySubdomain`, que será llamada frecuentemente por el middleware, implementar una capa de caché (por ejemplo, con un Redis separado o la caché en memoria de Next.js) podría reducir drásticamente la carga a la base de datos y mejorar la latencia. La caché se invalidaría cada vez que un tenant se actualiza o elimina.
 * 2. **Paginación:** La función `getAllTenants` podría volverse lenta con miles de tenants. Debería ser refactorizada para aceptar argumentos de `page` y `pageSize` y usar los métodos `.range()` de Supabase para implementar la paginación.
 * 3. **Funciones de Base de Datos (RPC):** Para operaciones más complejas, se podrían crear funciones en PostgreSQL y llamarlas a través de `supabase.rpc()`. Esto puede ser más performante ya que la lógica se ejecuta directamente en la base de datos.
 */

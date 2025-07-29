// Ruta: lib/data/modules.ts (REFACTORIZADO/PULIDO)
"use server";

import { type User } from "@supabase/supabase-js";
import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

/**
 * @file modules.ts
 * @description Aparato de datos especializado para obtener la configuración
 *              de los módulos de funcionalidades de la aplicación, personalizado
 *              para el usuario actual.
 * @author L.I.A Legacy
 * @version 2.0.0
 */

// TIPO EXPLÍCITO: Este es el contrato de datos que consumirán los componentes de la UI.
export type FeatureModule = {
  id: string;
  title: string;
  description: string;
  tooltip: string;
  icon: string; // Nombre del icono de Lucide
  href: string;
  status: "active" | "soon" | "locked"; // Estado dinámico basado en permisos
};

// Tipo interno para representar la jerarquía de planes.
type PlanHierarchy = "free" | "pro" | "enterprise";

/**
 * @description Obtiene todos los módulos de funcionalidades desde la base de datos.
 *              Esta función está cacheada agresivamente ya que los módulos cambian con poca frecuencia.
 * @returns {Promise<any[]>} Una promesa que resuelve a la lista de módulos crudos de la BD.
 */
const getBaseModules = cache(
  async () => {
    logger.info(
      `[Cache] MISS: Cargando feature_modules desde la base de datos.`
    );
    const supabase = createClient();
    const { data, error } = await supabase
      .from("feature_modules")
      .select("*")
      .order("display_order"); // Orden por defecto definido en la BD

    if (error) {
      logger.error("Error crítico al obtener feature_modules:", error);
      return [];
    }
    return data;
  },
  ["feature_modules"], // Clave de caché global
  { tags: ["feature_modules"] } // Tag para invalidación manual
);

/**
 * @description Obtiene y filtra los módulos para un usuario específico.
 *              Determina el estado de cada módulo (activo, bloqueado) basándose en el
 *              plan del usuario y reordena la lista según sus preferencias guardadas.
 * @param {User} user - El objeto de usuario de Supabase.
 * @returns {Promise<FeatureModule[]>} Una lista de módulos con estado y orden personalizados.
 */
export async function getFeatureModulesForUser(
  user: User
): Promise<FeatureModule[]> {
  const supabase = createClient();

  // Obtenemos los módulos base y el perfil del usuario en paralelo para eficiencia.
  const [baseModules, { data: profile }] = await Promise.all([
    getBaseModules(),
    supabase
      .from("profiles")
      .select("dashboard_layout")
      .eq("id", user.id)
      .single(),
  ]);

  if (!baseModules || baseModules.length === 0) {
    return [];
  }

  // Lógica de permisos basada en el plan del usuario
  const planHierarchy: Record<PlanHierarchy, number> = {
    free: 1,
    pro: 2,
    enterprise: 3,
  };
  const userPlan = (user.app_metadata?.plan as PlanHierarchy) || "free";
  const userLevel = planHierarchy[userPlan] || 1;

  const modulesWithStatus: FeatureModule[] = baseModules.map((mod) => {
    const requiredLevel =
      planHierarchy[mod.required_plan as PlanHierarchy] || 1;
    const isUnlocked = userLevel >= requiredLevel;

    // El estado final depende tanto del plan del usuario como del estado base del módulo.
    let status: FeatureModule["status"] = "locked";
    if (isUnlocked) {
      status = mod.status === "active" ? "active" : "soon";
    }

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      tooltip: mod.tooltip ?? "",
      icon: mod.icon_name,
      href: mod.href,
      status,
    };
  });

  // Reordenar los módulos según la preferencia del usuario si existe
  const userLayout = profile?.dashboard_layout as string[] | null;
  if (userLayout && userLayout.length > 0) {
    const moduleMap = new Map(modulesWithStatus.map((mod) => [mod.id, mod]));
    const orderedModules: FeatureModule[] = [];
    const remainingModules = new Set(modulesWithStatus);

    // Añadir módulos en el orden preferido por el usuario
    for (const moduleId of userLayout) {
      if (moduleMap.has(moduleId)) {
        const mod = moduleMap.get(moduleId)!;
        orderedModules.push(mod);
        remainingModules.delete(mod);
      }
    }

    // Añadir los módulos restantes (nuevos o no ordenados) al final
    return [...orderedModules, ...Array.from(remainingModules)];
  }

  return modulesWithStatus;
}
/*
[Análisis de Impacto]:
Claridad y Mantenibilidad: La lógica está ahora más limpia. La obtención de los módulos base está separada de la personalización por usuario. La lógica de reordenamiento es más robusta y maneja el caso de que se añadan nuevos módulos que el usuario aún no ha ordenado.
Rendimiento: El uso de Promise.all asegura que la consulta a la base de datos para los módulos (potencialmente cacheada) y la consulta del perfil del usuario se ejecuten en paralelo, minimizando la latencia.
Tipado Robusto: El tipo FeatureModule exportado asegura que componentes como DashboardClient y CommandPalette sepan exactamente qué esperar, sin depender de la inferencia de tipos de la base de datos.
*/

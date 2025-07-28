// Ruta: lib/data/modules.ts
/**
 * @file modules.ts
 * @description Capa de Acceso a Datos para la entidad 'FeatureModule'.
 * @refactor
 * REFACTORIZACIÓN ARQUITECTÓNICA: La lógica ahora obtiene los módulos directamente
 * desde la tabla `feature_modules` de Supabase, aplicando caché para optimizar
 * el rendimiento. También lee el layout personalizado del usuario desde su perfil.
 *
 * @author Metashark
 * @version 3.0.0 (Database-Driven & User-Customizable)
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { unstable_cache as cache } from "next/cache";

// El tipo ahora refleja la estructura de la tabla
export type FeatureModule = {
  id: string;
  title: string;
  description: string;
  tooltip: string;
  icon: string;
  href: string;
  status: "active" | "soon" | "locked";
  requiredPlan: "free" | "pro" | "enterprise";
};

/**
 * @description Obtiene y filtra los módulos para un usuario específico desde la BD.
 * @param {User} user - El objeto de usuario de Supabase.
 * @returns {Promise<FeatureModule[]>} Una lista de módulos con estado y orden personalizados.
 */
export async function getFeatureModulesForUser(
  user: User
): Promise<FeatureModule[]> {
  const supabase = createClient();

  // Obtenemos los módulos y el perfil del usuario en paralelo.
  const [modulesResult, profileResult] = await Promise.all([
    // Usamos la caché de Next.js para los módulos, ya que cambian con poca frecuencia.
    // Se invalidará si se actualiza la tabla 'feature_modules'.
    cache(
      async () => {
        return supabase
          .from("feature_modules")
          .select("*")
          .order("display_order");
      },
      ["feature_modules"],
      { tags: ["feature_modules"] }
    )(),
    supabase
      .from("profiles")
      .select("dashboard_layout")
      .eq("id", user.id)
      .single(),
  ]);

  const { data: dbModules, error: modulesError } = modulesResult;
  if (modulesError || !dbModules) {
    return [];
  }

  // Lógica para determinar qué módulos están desbloqueados
  const userPlan = user.app_metadata?.plan || "free";
  const planHierarchy = { free: 1, pro: 2, enterprise: 3 };
  const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 1;

  let modulesWithStatus: FeatureModule[] = dbModules.map((mod) => {
    const requiredLevel =
      planHierarchy[mod.required_plan as keyof typeof planHierarchy];
    const isActive = userLevel >= requiredLevel;
    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      tooltip: mod.tooltip ?? "",
      icon: mod.icon_name,
      href: mod.href,
      requiredPlan: mod.required_plan as any,
      status: isActive ? "active" : "locked",
    };
  });

  // Reordenar los módulos según la preferencia del usuario si existe
  const userLayout = profileResult.data?.dashboard_layout as string[] | null;
  if (userLayout && userLayout.length > 0) {
    modulesWithStatus.sort((a, b) => {
      const indexA = userLayout.indexOf(a.id);
      const indexB = userLayout.indexOf(b.id);
      // Pone los módulos no encontrados en el layout al final
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  return modulesWithStatus;
}

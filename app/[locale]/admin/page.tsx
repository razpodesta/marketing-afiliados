// app/[locale]/admin/page.tsx
/**
 * @file page.tsx
 * @description Página del Dashboard de Administración (Server Component).
 *              Este aparato ha sido refactorizado para implementar un manejo de
 *              errores seguro en cuanto a tipos (`type-safe`), resolviendo el
 *              error de compilación `TS2345` al interactuar con el logger.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 9.0.0 (Type-Safe Error Handling)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import * as dataLayer from "@/lib/data";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { rootDomain } from "@/lib/utils";

import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Gestionar todos los sitios en la plataforma ${rootDomain}.`,
};

const ADMIN_SITES_PER_PAGE = 12;

/**
 * @function AdminDashboardSkeleton
 * @description Componente de esqueleto de carga para el dashboard de administración.
 *              Proporciona un feedback visual inmediato al usuario mientras se
 *              cargan los datos del servidor.
 * @returns {JSX.Element} La UI del esqueleto de carga.
 */
const AdminDashboardSkeleton = () => (
  <div className="p-4 md:p-8">
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-md animate-pulse"></div>
          <div className="h-5 w-64 bg-muted rounded-md mt-2 animate-pulse"></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-40 animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * @async
 * @function AdminDashboardLoader
 * @description Componente de servidor que maneja la lógica de obtención de datos
 *              y seguridad para el dashboard de administración.
 * @param {{ searchParams: { page?: string } }} props - Las props del componente.
 * @returns {Promise<JSX.Element>} El componente de cliente (`AdminClient`) con los
 *                                  datos o una redirección/UI de error.
 */
async function AdminDashboardLoader({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  const allowedRoles: Array<Database["public"]["Enums"]["app_role"]> = [
    "admin",
    "developer",
  ];

  if (!profile || !allowedRoles.includes(profile.app_role)) {
    logger.warn(
      `Acceso denegado a /admin para el usuario ${user.id} con rol '${profile?.app_role}'`
    );
    return redirect("/dashboard");
  }

  try {
    const page = Number(searchParams.page) || 1;
    const { sites: rawSites, totalCount } = await dataLayer.admin.getAllSites({
      page,
      limit: ADMIN_SITES_PER_PAGE,
    });

    const sites = rawSites.map((site: SiteWithCampaignsCount) => ({
      subdomain: site.subdomain || "N/A",
      icon: site.icon || "❓",
      createdAt: new Date(site.created_at).getTime(),
    }));

    return (
      <AdminClient
        sites={sites}
        user={user}
        totalCount={totalCount}
        page={page}
        limit={ADMIN_SITES_PER_PAGE}
      />
    );
  } catch (error) {
    // --- INICIO DE REFACTORIZACIÓN DE MANEJO DE ERRORES ---
    // Verificamos si el error es una instancia de Error para acceder a sus
    // propiedades de forma segura. Si no, lo convertimos a string.
    // Esto satisface el contrato de tipo de `logger.error`.
    const errorContext =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error: String(error) };
    logger.error(
      "Error al cargar los datos del dashboard de admin:",
      errorContext
    );
    // --- FIN DE REFACTORIZACIÓN DE MANEJO DE ERRORES ---
    return (
      <p className="text-destructive p-8">
        Error al cargar los datos de la plataforma.
      </p>
    );
  }
}

/**
 * @function AdminPage
 * @description Componente de página principal que utiliza `Suspense` para orquestar
 *              una experiencia de carga fluida, mostrando un esqueleto mientras los
 *              datos se obtienen en el servidor.
 * @param {{ searchParams: { page?: string } }} props - Las props de la página.
 * @returns {JSX.Element} La página de administración renderizada.
 */
export default function AdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  return (
    <div className="min-h-screen bg-card">
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Manejo de Errores Seguro en Tipos**: ((Implementada)) Se ha refactorizado el bloque `catch` para verificar el tipo del objeto de error antes de pasarlo al logger, resolviendo el error de compilación `TS2345` y adhiriéndose a las mejores prácticas de TypeScript.
 *
 * @subsection Melhorias Futuras
 * 1. **Componente de Error Dedicado**: ((Vigente)) En lugar de renderizar un simple `<p>`, se podría crear un componente de error reutilizable (`<ErrorDisplay />`) que muestre un mensaje más amigable, un ID de error para soporte y quizás una opción para reintentar la carga.
 * 2. **Paginación en `getAllSites`**: ((Vigente)) Asegurar que la función `getAllSites` en la capa de datos implemente una paginación robusta para manejar un gran número de sitios sin afectar el rendimiento.
 */
// app/[locale]/admin/page.tsx

// app/[locale]/admin/page.tsx
/**
 * @file page.tsx
 * @description Página del Dashboard de Administración (Server Component).
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.1.0 (Type Safety and Import Fix)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
// --- INICIO DE CORRECCIÓN ---
import * as dataLayer from "@/lib/data"; // Importar todos los namespaces de la capa de datos.
import type { SiteWithCampaignsCount } from "@/lib/data/sites"; // Importar el tipo explícito.
// --- FIN DE CORRECCIÓN ---
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
      // Uso del namespace correcto.
      page,
      limit: ADMIN_SITES_PER_PAGE,
    });

    // CORRECCIÓN: El tipo explícito `SiteWithCampaignsCount` informa al compilador
    // sobre la forma de cada elemento, resolviendo el error de `any` implícito.
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
    logger.error("Error al cargar los datos del dashboard de admin:", error);
    return (
      <p className="text-destructive p-8">
        Error al cargar los datos de la plataforma.
      </p>
    );
  }
}

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
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros: Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=search-term`) que se pasarían a la función `getAllSites` para permitir filtrar los resultados directamente desde la base de datos.
 * 2. Componente de Error Dedicado: En lugar de renderizar un simple `<p>`, crear un componente de error reutilizable que pueda mostrar un mensaje más amigable y quizás una opción para reintentar la carga.
 * 3. Ordenamiento: Añadir parámetros de ordenamiento a la URL (ej. `?sort=createdAt&order=asc`) para permitir al administrador ordenar la lista de sitios por diferentes columnas.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Crear la Página de Onboarding (`/welcome`): La mejora más inmediata es crear la página `/welcome` a la que se redirige a los nuevos usuarios, para que puedan configurar su primer workspace o recibir un tour guiado por la aplicación.
 * 2. Lógica de Onboarding Basada en Perfil: En lugar de depender solo de las marcas de tiempo de la sesión, se podría añadir un campo booleano `has_completed_onboarding` a la tabla `profiles`. La comprobación aquí sería más robusta y permitiría a los usuarios retomar el onboarding si lo abandonaron.
 * 3. Centralizar la Lógica de Sesión en el Layout: Para optimizar, la llamada a `getUser()` podría hacerse una sola vez en el `dashboard/layout.tsx` y pasar los datos a las páginas hijas, evitando que cada página del dashboard tenga que volver a validar la sesión.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros: Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=search-term`) que se pasarían a la función `getAllSites` para permitir filtrar los resultados directamente desde la base de datos.
 * 2. Componente de Error Dedicado: En lugar de renderizar un simple `<p>`, crear un componente de error reutilizable que pueda mostrar un mensaje más amigable y quizás una opción para reintentar la carga.
 * 3. Ordenamiento: Añadir parámetros de ordenamiento a la URL (ej. `?sort=createdAt&order=asc`) para permitir al administrador ordenar la lista de sitios por diferentes columnas.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros: Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=search-term`) que se pasarían a la función `getAllSites` para permitir filtrar los resultados directamente desde la base de datos.
 * 2. Componente de Error Dedicado: En lugar de renderizar un simple `<p>`, crear un componente de error reutilizable que pueda mostrar un mensaje más amigable y quizás una opción para reintentar la carga.
 * 3. Ordenamiento: Añadir parámetros de ordenamiento a la URL (ej. `?sort=createdAt&order=asc`) para permitir al administrador ordenar la lista de sitios por diferentes columnas.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros: Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=search-term`) que se pasarían a la función `getAllSites` para permitir filtrar los resultados directamente desde la base de datos.
 * 2. Componente de Error Dedicado: En lugar de renderizar un simple `<p>`, crear un componente de error reutilizable que pueda mostrar un mensaje más amigable y quizás una opción para reintentar la carga.
 * 3. Ordenamiento: Añadir parámetros de ordenamiento a la URL (ej. `?sort=createdAt&order=asc`) para permitir al administrador ordenar la lista de sitios por diferentes columnas.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Estado de Carga por Tarjeta: En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 2. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 3. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda y Filtros: Añadir soporte para parámetros de búsqueda en la URL (ej. `?q=search-term`) que se pasarían a la función `getAllSites` para permitir filtrar los resultados directamente desde la base de datos.
 * 2. Componente de Error Dedicado: En lugar de renderizar un simple `<p>`, crear un componente de error reutilizable que pueda mostrar un mensaje más amigable y quizás una opción para reintentar la carga.
 * 3. Ordenamiento: Añadir parámetros de ordenamiento a la URL (ej. `?sort=createdAt&order=asc`) para permitir al administrador ordenar la lista de sitios por diferentes columnas.
 */

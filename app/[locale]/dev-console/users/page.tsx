// app/[locale]/dev-console/users/page.tsx
/**
 * @file page.tsx
 * @description Contenedor de Servidor de élite para la página de Gestión de Usuarios.
 *              Este aparato es el único responsable de la seguridad y la obtención
 *              de datos iniciales para la ruta. Delega toda la renderización
 *              interactiva y la composición de la UI a su componente hijo de cliente.
 * @author L.I.A Legacy
 * @version 6.0.0 (Canonical Server Container Pattern)
 */
import { redirect } from "next/navigation";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { admin as adminData } from "@/lib/data";
import { logger } from "@/lib/logging";

import { UsersClient } from "./users-client";

const USERS_PER_PAGE = 20;

/**
 * Orquesta la carga de datos y la seguridad para la página de gestión de usuarios.
 * @component
 * @param {object} props - Propiedades de la página.
 * @param {object} props.searchParams - Parámetros de la URL para paginación y búsqueda.
 * @returns {Promise<React.ReactElement>} El componente de cliente con los datos iniciales o un estado de error.
 */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const roleCheck = await requireAppRole(["developer"]);
  if (!roleCheck.success) {
    logger.warn(
      `[DevConsole/Users] Acceso denegado: ${roleCheck.error}. Redirigiendo.`
    );
    const redirectPath =
      roleCheck.error === "SESSION_NOT_FOUND"
        ? "/login?next=/dev-console/users"
        : "/dashboard";
    return redirect(redirectPath);
  }

  const page = Number(searchParams.page) || 1;
  const searchQuery = searchParams.q || "";

  try {
    const { profiles, totalCount } = await adminData.getPaginatedUsersWithRoles(
      {
        page,
        limit: USERS_PER_PAGE,
        query: searchQuery,
      }
    );

    return (
      <UsersClient
        profiles={profiles}
        totalCount={totalCount ?? 0}
        page={page}
        limit={USERS_PER_PAGE}
        searchQuery={searchQuery}
      />
    );
  } catch (error) {
    logger.error(
      "[DevConsole/Users] Error al cargar la lista de usuarios:",
      error instanceof Error ? error.message : String(error)
    );
    return (
      <div className="p-4 rounded-md border border-destructive bg-destructive/10 text-destructive-foreground">
        <h3 className="font-semibold">Error al cargar la lista de usuarios.</h3>
        <p className="mt-2 text-sm">
          No se pudo obtener la información desde la capa de datos. Por favor,
          intente de nuevo más tarde.
        </p>
      </div>
    );
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Arquitectura Canónica RSC**: ((Implementada)) Este componente ahora cumple perfectamente su rol de Contenedor de Servidor: seguridad, obtención de datos y delegación al cliente.
 * 2. **Soporte para Búsqueda en Servidor**: ((Implementada)) La lógica lee el parámetro `q` y lo pasa a la capa de datos para un filtrado eficiente.
 * 3. **Manejo de Errores Robusto**: ((Implementada)) Utiliza un bloque `try/catch` para manejar fallos en la capa de datos y renderizar una UI de error clara, mejorando la observabilidad.
 *
 * @subsection Melhorias Futuras
 * 1. **Error Boundary**: ((Vigente)) Envolver la llamada al componente cliente en un `<Suspense>` con un `fallback` y un Error Boundary de React para manejar errores de renderizado de forma más elegante.
 */
// app/[locale]/dev-console/users/page.tsx

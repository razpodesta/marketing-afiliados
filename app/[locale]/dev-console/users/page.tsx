// app/[locale]/dev-console/users/page.tsx
/**
 * @file page.tsx
 * @description Página de Gestión de Usuarios para el `dev-console`.
 *              Ha sido refactorizada para consumir la capa de datos canónica,
 *              eliminando las consultas directas a la base de datos y mejorando
 *              la integridad arquitectónica.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Data Layer Abstraction)
 */
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { admin as adminData } from "@/lib/data";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { UserManagementTable } from "../components/UserManagementTable";

const USERS_PER_PAGE = 20;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;

  try {
    // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    // La consulta directa a Supabase ha sido reemplazada por una llamada
    // a la capa de datos abstraída.
    const { profiles, totalCount } = await adminData.getPaginatedUsersWithRoles(
      {
        page,
        limit: USERS_PER_PAGE,
      }
    );
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios y Roles</h1>
          <p className="text-muted-foreground">
            Supervisa y asigna roles a todos los usuarios de la plataforma.
          </p>
        </div>
        <UserManagementTable
          profiles={profiles}
          totalCount={totalCount ?? 0}
          page={page}
          limit={USERS_PER_PAGE}
        />
      </div>
    );
  } catch (error: any) {
    // Manejo de error si la capa de datos lanza una excepción.
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-destructive">
          Error al cargar la lista de usuarios.
        </h3>
        <p className="mt-2 text-muted-foreground">
          No se pudo obtener la información desde la capa de datos.
        </p>
      </div>
    );
  }
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Manejo de Errores Amigable**: ((Vigente)) Mostrar un componente de error más sofisticado y registrar el error completo en un servicio de monitoreo.
 *
 * @subsection Mejoras Implementadas
 * 1. **Abstracción de Capa de Datos**: ((Implementada)) Se ha eliminado la consulta directa a Supabase, y el componente ahora consume la función `getPaginatedUsersWithRoles` de `lib/data/admin.ts`.
 */
// app/[locale]/dev-console/users/page.tsx

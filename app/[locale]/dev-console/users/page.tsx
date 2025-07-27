/* Ruta: app/[locale]/dev-console/users/page.tsx */

import { createClient } from "@/lib/supabase/server";
import { UserManagementTable } from "../components/UserManagementTable";

/**
 * @file page.tsx
 * @description Página de Gestión de Usuarios para el `dev-console`.
 * REFACTORIZACIÓN DE ROBUSTEZ: Se ha mantenido la lógica de paginación y se ha
 * mejorado el manejo de errores. La consulta ahora se basa en un archivo de
 * tipos (`database.types.ts`) actualizado que refleja la relación de clave
 * externa correcta entre las tablas `profiles` y `users`.
 *
 * @author Metashark
 * @version 2.2.0 (Type Synchronization)
 */

const USERS_PER_PAGE = 20;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * USERS_PER_PAGE;
  const to = from + USERS_PER_PAGE - 1;

  // Con los tipos regenerados, esta consulta ahora será completamente segura en tipos.
  const {
    data: users,
    error,
    count,
  } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      app_role,
      users (
          email
      )
    `,
      { count: "exact" }
    )
    .range(from, to);

  if (error) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-destructive">
          Error al cargar la lista de usuarios:
        </h3>
        <p className="mt-2 font-mono text-sm bg-muted p-2 rounded-md">
          {error.message}
        </p>
        <p className="mt-4 text-muted-foreground">
          <b>Sugerencia:</b> Este error puede ocurrir si los tipos de la base de
          datos no están sincronizados. Intenta ejecutar `pnpm run
          supabase:gen-types` para actualizar el archivo
          `lib/database.types.ts`.
        </p>
      </div>
    );
  }

  // La transformación de datos ahora es segura y explícita.
  const profilesForTable = users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    app_role: u.app_role,
    // La consulta devuelve un objeto `users` si la relación existe.
    // Si es un array, es un error de configuración de la relación (uno a muchos).
    email: Array.isArray(u.users)
      ? "Error de relación"
      : u.users?.email || "N/A",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Usuarios y Roles</h1>
        <p className="text-muted-foreground">
          Supervisa y asigna roles a todos los usuarios de la plataforma.
        </p>
      </div>
      <UserManagementTable
        profiles={profilesForTable}
        totalCount={count ?? 0}
        page={page}
        limit={USERS_PER_PAGE}
      />
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase está directamente en el componente de página. Para una mejor separación de responsabilidades, esta consulta podría moverse a una función dedicada en un nuevo archivo `lib/data/users.ts`.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error técnico, se podría mostrar un componente de error genérico y registrar el error completo en un servicio de monitoreo (como Sentry).
 * 3. Búsqueda y Filtrado de Usuarios: Para una consola de desarrollador verdaderamente funcional, añadir un campo de búsqueda en la parte superior de la `UserManagementTable` para filtrar usuarios por email o nombre es una mejora de alta prioridad.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase está directamente en el componente de página. Para una mejor separación de responsabilidades, esta consulta podría moverse a una función dedicada en un nuevo archivo `lib/data/users.ts`.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error técnico, se podría mostrar un componente de error genérico y registrar el error completo en un servicio de monitoreo (como Sentry).
 * 3. Búsqueda y Filtrado de Usuarios: Para una consola de desarrollador verdaderamente funcional, añadir un campo de búsqueda en la parte superior de la `UserManagementTable` para filtrar usuarios por email o nombre es una mejora de alta prioridad.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase está directamente en el componente de página. Para una mejor separación de responsabilidades, esta consulta podría moverse a una función dedicada en `lib/data/users.ts`, de manera similar a como se hizo con `lib/data/sites.ts`.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error de la base de datos directamente, se podría mostrar un componente de error más amigable y registrar el error técnico en un servicio de monitoreo (como Sentry) para que el equipo de desarrollo lo investigue.
 * 3. Búsqueda y Filtrado de Usuarios: Para una consola de desarrollador verdaderamente funcional, añadir un campo de búsqueda en la parte superior de la `UserManagementTable` para filtrar usuarios por email o nombre es una mejora de alta prioridad.
 */

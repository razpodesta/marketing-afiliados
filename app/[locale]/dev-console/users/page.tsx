// Ruta: app/[locale]/dev-console/users/page.tsx
/**
 * @file page.tsx
 * @description Página de Gestión de Usuarios para el `dev-console`.
 * REFACTORIZACIÓN DE TIPOS: Se ha corregido el mapeo de datos para que coincida
 * con la estructura del tipo `ProfileRow` esperado por `UserManagementTable`.
 * Ahora se incluye `avatar_url`, resolviendo el error de compilación `TS2322`.
 *
 * @author Metashark
 * @version 3.1.0 (Type-Safe Data Mapping)
 */

import { createClient } from "@/lib/supabase/server";

import { UserManagementTable } from "../components/UserManagementTable";

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

  const {
    data: profiles,
    error,
    count,
  } = await supabase
    .from("user_profiles_with_email")
    .select("*", { count: "exact" })
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
          <b>Sugerencia:</b> Este error puede ocurrir si la vista
          `user_profiles_with_email` no existe. Asegúrate de que las migraciones
          de la base de datos se hayan ejecutado correctamente.
        </p>
      </div>
    );
  }

  // CORRECCIÓN: El mapeo ahora incluye todos los campos requeridos por el tipo ProfileRow.
  const profilesForTable =
    profiles?.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      app_role: p.app_role,
      email: p.email,
      avatar_url: p.avatar_url,
    })) || [];

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
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase podría moverse a una función dedicada en un nuevo archivo `lib/data/users.ts` para una mejor separación de responsabilidades.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error técnico, se podría mostrar un componente de error genérico y registrar el error completo en un servicio de monitoreo (como Sentry).
 * 3. Ordenamiento de Columnas: Añadir la capacidad de hacer clic en las cabeceras de la tabla (`TableHead`) para ordenar la lista de usuarios por email, nombre o rol, pasando parámetros de orden a la consulta de la base de datos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase podría moverse a una función dedicada en un nuevo archivo `lib/data/users.ts` para una mejor separación de responsabilidades.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error técnico, se podría mostrar un componente de error genérico y registrar el error completo en un servicio de monitoreo (como Sentry).
 * 3. Ordenamiento de Columnas: Añadir la capacidad de hacer clic en las cabeceras de la tabla (`TableHead`) para ordenar la lista de usuarios por email, nombre o rol, pasando parámetros de orden a la consulta de la base de datos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción de la Capa de Datos: La lógica de la consulta de Supabase podría moverse a una función dedicada en un nuevo archivo `lib/data/users.ts` para una mejor separación de responsabilidades.
 * 2. Manejo de Errores más Amigable: En lugar de mostrar el mensaje de error técnico, se podría mostrar un componente de error genérico y registrar el error completo en un servicio de monitoreo (como Sentry).
 * 3. Ordenamiento de Columnas: Añadir la capacidad de hacer clic en las cabeceras de la tabla (`TableHead`) para ordenar la lista de usuarios por email, nombre o rol, pasando parámetros de orden a la consulta de la base de datos.
 */
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

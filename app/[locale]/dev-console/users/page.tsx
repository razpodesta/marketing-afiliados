/* Ruta: app/[locale]/dev-console/users/page.tsx */

import { createClient } from "@/lib/supabase/server";
import { UserManagementTable } from "../components/UserManagementTable";

/**
 * @file page.tsx
 * @description Página de Gestión de Usuarios para el `dev-console`.
 * REFACTORIZACIÓN DE ESCALABILIDAD: Se ha implementado la paginación en la
 * consulta de usuarios. La página ahora solo obtiene un subconjunto de usuarios
 * por vez, asegurando que pueda escalar a una base de usuarios de cualquier tamaño
 * sin degradar el rendimiento.
 *
 * @author Metashark
 * @version 2.0.0 (Pagination Implementation)
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

  // Consulta actualizada para ser paginada
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
      user:users (
          email
      )
    `,
      { count: "exact" }
    )
    .range(from, to);

  if (error) {
    return (
      <p className="text-destructive">
        Error al cargar la lista de usuarios: {error.message}
      </p>
    );
  }

  // Transformamos los datos para aplanar la estructura
  const profilesForTable = users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    app_role: u.app_role,
    // @ts-ignore: Supabase gen types no siempre infiere bien los joins
    email: u.user?.email || "N/A",
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

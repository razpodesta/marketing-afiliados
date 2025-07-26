/* Ruta: app/[locale]/dashboard/layout.tsx */

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * @file layout.tsx
 * @description Layout principal del Dashboard. Su estructura con Flexbox permite que
 * el contenido principal (`children`) se expanda para llenar el espacio disponible,
 * lo cual es clave para el diseño de "Centro de Comando" de una sola pantalla.
 *
 * @author Metashark
 * @version 7.1.0 (Layout Structure Verification)
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: userMemberships, error: wsError } = await supabase
    .from("workspace_members")
    .select("workspaces (id, name)")
    .eq("user_id", user.id);

  if (wsError) {
    logger.error("Error cargando workspaces en el layout:", wsError);
  }

  const workspaces =
    (userMemberships?.map((member) => member.workspaces).filter(Boolean) as {
      id: string;
      name: string;
    }[]) || [];

  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;
  let activeWorkspace = null;

  if (activeWorkspaceId) {
    activeWorkspace =
      workspaces.find((ws) => ws.id === activeWorkspaceId) || null;
  }

  if (!activeWorkspace && workspaces.length > 0) {
    activeWorkspace = workspaces[0];
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar user={user} />
      <div className="flex flex-col bg-background">
        <DashboardHeader
          user={user}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
        />
        <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
/* Ruta: app/[locale]/dashboard/layout.tsx */

/* MEJORAS PROPUESTAS
 * 1. Contexto de React para Datos de Sesión: En lugar de pasar `user`, `workspaces` y `activeWorkspace` como props a través de la jerarquía (prop drilling), crear un `SessionProvider` en este layout que utilice React Context para hacer estos datos disponibles a todos los componentes cliente anidados de una forma más limpia y eficiente.
 * 2. Flujo de Onboarding para Nuevos Usuarios: Añadir una lógica aquí que verifique si `workspaces` está vacío. Si es así, en lugar de renderizar el dashboard, se podría redirigir al usuario a una página de bienvenida `/welcome` para crear su primer workspace, guiándolo en sus primeros pasos.
 * 3. Carga de Datos con `Promise.all`: Las consultas para obtener el usuario y los workspaces se ejecutan en serie. Se pueden ejecutar en paralelo usando `Promise.all` para reducir ligeramente el tiempo de carga del layout en el servidor.
 */
/* MEJORAS PROPUESTAS
 * 1. **Contexto de React para Datos de Sesión:** En lugar de pasar `user`, `workspaces` y `activeWorkspace` como props a través de la jerarquía (prop drilling), crear un `SessionProvider` en este layout que utilice React Context para hacer estos datos disponibles a todos los componentes cliente anidados de una forma más limpia y eficiente.
 * 2. **Flujo de Onboarding para Nuevos Usuarios:** Añadir una lógica aquí que verifique si `workspaces` está vacío. Si es así, en lugar de renderizar el dashboard, se podría redirigir al usuario a una página de bienvenida `/welcome` para crear su primer workspace, guiándolo en sus primeros pasos.
 * 3. **Carga de Datos con `Promise.all`:** Las consultas para obtener el usuario y los workspaces se ejecutan en serie. Se pueden ejecutar en paralelo usando `Promise.all` para reducir ligeramente el tiempo de carga del layout en el servidor.
1.  **Centralización de Datos con Context:** Una vez que la carga de datos es estable en las páginas, se puede usar un Proveedor de Contexto de React en este layout para distribuir los datos (como el usuario y el workspace activo) a los componentes cliente de forma más eficiente, sin necesidad de "prop drilling".
1.  **React Context para Workspace:** Usar React Context en este layout para hacer que el `activeWorkspace` esté disponible en toda la aplicación cliente sin pasarlo como prop.
2.  **Página de "Crear Workspace":** Si `workspaces` está vacío después de la consulta, redirigir al usuario a una página de onboarding `/create-workspace`.
1.  **Consulta de Workspaces Compleja:** La consulta actual solo trae los workspaces donde el usuario es `owner`. Debe ser reemplazada por una que consulte la tabla `workspace_members` para obtener todos los workspaces a los que el usuario ha sido invitado.
2.  **React Context para Workspace:** En lugar de recargar la página, una arquitectura más avanzada usaría el Provider de React Context en este layout para hacer que el `activeWorkspace` esté disponible en toda la aplicación cliente sin necesidad de pasarlo como prop a cada página.
3.  **Encabezado del Dashboard:** Añadir un componente `DashboardHeader` que contenga el `WorkspaceSwitcher` y otros elementos como notificaciones o un menú de perfil.
 * 1. **Encabezado del Dashboard:** Añadir un componente `DashboardHeader` dentro de `<main>`.
 * 2. **Datos del Perfil del Usuario:** Hacer un `join` con la tabla `profiles` aquí para obtener datos enriquecidos.
 */

/* MEJORAS PROPUESTAS
 * 1. **Encabezado del Dashboard:** Añadir un componente `DashboardHeader` dentro de `<main>` que muestre el título de la página y acciones rápidas.
 * 2. **Datos del Perfil del Usuario:** Hacer un `join` con la tabla `profiles` aquí para obtener y pasar datos enriquecidos (como `full_name`) a los componentes del dashboard.
 */
/* MEJORAS PROPUESTAS
Encabezado del Dashboard: Añadir un componente DashboardHeader dentro de <main> que pueda mostrar el título de la página actual y acciones rápidas como un selector de workspace o notificaciones.
Datos del Perfil del Usuario: En lugar de pasar solo el objeto user de supabase.auth, se podría hacer un join con la tabla profiles aquí para obtener y pasar datos enriquecidos (como full_name y avatar_url) a los componentes del dashboard.
*/
/* MEJORAS PROPUESTAS
 * 1. **Encabezado del Dashboard:** Añadir un componente `DashboardHeader` dentro de `<main>` que pueda mostrar el título de la página actual (usando `useSelectedLayoutSegment` en un componente cliente) y acciones rápidas.
 * 2. **Gestión de Estado Global:** Para funcionalidades más complejas (como notificaciones en tiempo real o el estado del plan del usuario), se podría integrar un gestor de estado como Zustand o Jotai, inicializándolo en este layout.
 */

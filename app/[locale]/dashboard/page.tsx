/* Ruta: app/[locale]/dashboard/page.tsx */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import { logger } from "@/lib/logging";

/**
 * @file Página Principal del Dashboard del Suscriptor (Server Component).
 * @description Punto de entrada para el dashboard. Gestiona la autenticación del usuario.
 * REFACTORIZACIÓN CRÍTICA: Se ha eliminado la lógica de obtención de 'sites'
 * y la prop 'initialSites' que se pasaba a `DashboardClient`. El nuevo diseño del
 * "Centro de Comando" no requiere esta información, y la discrepancia de props
 * estaba causando un error fatal de compilación en el despliegue.
 *
 * @author Metashark
 * @version 4.0.0 (Build Fix & Prop Concordance)
 */
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("Intento de acceso al dashboard sin sesión. Redirigiendo a login.");
    return redirect("/login");
  }

  // La lógica para obtener 'sites' y 'workspaceId' ha sido eliminada
  // ya que el DashboardClient rediseñado no los necesita en esta vista principal.
  // La gestión de sitios se realizará en la página dedicada '/dashboard/sites'.

  return (
    <Suspense fallback={<p>Cargando tu Centro de Comando...</p>}>
      {/* El componente DashboardClient ya no recibe `initialSites` */}
      <DashboardClient user={user} />
    </Suspense>
  );
}
/* Ruta: app/[locale]/dashboard/page.tsx */


/* MEJORAS FUTURAS DETECTADAS
 * 1. Esqueleto de Carga (Skeleton) Sofisticado: Reemplazar el `fallback` de Suspense, que es un simple texto, por un componente `DashboardSkeleton` visual. Este componente imitaría la estructura del dashboard (sidebar, header, y cuadrícula de tarjetas) con formas grises animadas, mejorando drásticamente la percepción de velocidad de carga.
 * 2. Página de Onboarding para Nuevos Usuarios: Añadir una comprobación después de obtener el `user`. Si es la primera visita del usuario (se puede comprobar con un campo `last_login_at` o similar en la tabla `profiles`), redirigirlo a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard principal.
 * 3. Gestión de Errores de Carga de Sesión: Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, la aplicación fallará. Capturar el error permitiría mostrar una página de error amigable en lugar de un crash de la aplicación.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton) Sofisticado:** Reemplazar el `fallback` de Suspense, que es un simple texto, por un componente `DashboardSkeleton` visual. Este componente imitaría la estructura del dashboard (sidebar, header, y cuadrícula de tarjetas) con formas grises animadas, mejorando drásticamente la percepción de velocidad de carga.
 * 2. **Página de Onboarding para Nuevos Usuarios:** Añadir una comprobación después de obtener el `user`. Si es la primera visita del usuario (se puede comprobar con un campo `last_login_at` en la tabla `profiles`), redirigirlo a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard principal.
 * 3. **Gestión de Errores de Carga de Sesión:** Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, la aplicación fallará. Capturar el error permitiría mostrar una página de error amigable en lugar de un crash de la aplicación.
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo.
 * 2. **Manejo de Errores de Carga:** Envolver las llamadas a la base de datos en un `try/catch`.
 * 3. **Página de "Crear Workspace":** Redirigir al usuario a `/create-workspace` si no tiene uno.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo.
 * 2. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para mostrar un componente de error en la UI si la base de datos falla.
 * 3. **Página de "Crear Workspace":** Si `workspaceId` es nulo, redirigir al usuario a una página `/create-workspace` para guiarlo.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para manejar elegantemente los casos en que la base de datos no esté disponible, mostrando un componente de error en la UI.
 * 3. **Página de "Crear Workspace":** Si `workspaceId` es nulo, en lugar de mostrar un dashboard vacío, redirigir al usuario a una página `/create-workspace` para guiarlo en su primer paso.
 */
/* MEJORAS PROPUESTAS
 * 1. **Gestión de Workspaces:** El siguiente paso lógico es implementar la lógica para establecer el `active_workspace_id` en la sesión del usuario al iniciar sesión o a través de un selector en la UI.
 * 2. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 3. **Manejo de Errores de Carga:** Envolver `getSitesByWorkspaceId` en un `try/catch` para manejar elegantemente los casos en que la base de datos no esté disponible.
 */
/* MEJORAS PROPUESTAS
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Manejo de Errores de Carga:** Envolver `getTenantsByOwner` en un `try/catch` y pasar un estado de error al `DashboardClient` para mostrar un mensaje amigable si la base de datos no está disponible.
 * 3. **Componente de "Estado Vacío":** Si el usuario no tiene ninguna campaña, mostrar un componente amigable que lo invite a crear su primera campaña, en lugar de un simple texto.
 * 1. **Esqueleto de Carga (Skeleton):** Reemplazar el `fallback` de Suspense con un componente de esqueleto de carga visualmente atractivo para mejorar la percepción de velocidad.
 * 2. **Layout de Dashboard:** Crear un `layout.tsx` en esta carpeta para añadir elementos compartidos como una barra lateral de navegación, que será necesaria cuando añadamos la gestión de campañas, facturación, etc.
 * 3. **Manejo de Errores de Carga:** Envolver `getTenantsByOwner` en un `try/catch` y pasar un estado de error al `DashboardClient` para mostrar un mensaje amigable si la base de datos no está disponible.
 * 1. **Carga de Datos del Tenant:** Crear una función `getTenantsByOwner(ownerId)` en `lib/platform/tenants.ts` y llamarla aquí para obtener y mostrar la lista de tenants del usuario.
 * 2. **Layout de Dashboard:** Crear un archivo `app/[locale]/dashboard/layout.tsx` que incluya una barra lateral de navegación y un encabezado comunes para todas las páginas dentro del dashboard.
 * 3. **Componente de "Estado Vacío":** Si el usuario no tiene ninguna campaña, mostrar un componente amigable que lo invite a crear su primera campaña, en lugar de un simple texto.
 */

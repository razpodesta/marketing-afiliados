// app/[locale]/dashboard/page.tsx
/**
 * @file Subscriber Dashboard Page (Server Component)
 * @description Punto de entrada para el dashboard. Se encarga de la autenticación
 * y de la carga inicial de datos (lista de tenants del usuario).
 *
 * @author Metashark
 * @version 2.3.0 (Data Loading Activated)
 */
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenantsByOwner } from "@/lib/platform/tenants";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // CORRECCIÓN: Se activa la carga de datos de los tenants que pertenecen al usuario.
  const tenants = await getTenantsByOwner(session.user.id);

  return (
    <Suspense fallback={<p>Cargando tu dashboard...</p>}>
      {/* CORRECCIÓN: Se pasa la prop `initialTenants` al componente cliente. */}
      <DashboardClient session={session} initialTenants={tenants} />
    </Suspense>
  );
}

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

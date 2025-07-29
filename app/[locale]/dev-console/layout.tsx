// app/[locale]/dev-console/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal para el Dashboard de Desarrollador (`/dev-console`).
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Architectural Alignment)
 */
"use server"; // <-- Se convierte a Server Component para obtener la sesión

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import { DevSidebarClient } from "./components/DevSidebarClient";

export default async function DevConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?next=/dev-console");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.app_role !== "developer") {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DevSidebarClient />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
/* Ruta: app/[locale]/dev-console/layout.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Componente de Perfil de Desarrollador: Reemplazar el simple botón de "Cerrar Sesión" (que está dentro de DevSidebarClient) por un menú desplegable (`DropdownMenu`) que se active desde el layout. Este podría mostrar el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 2. Carga de Datos Globales del Layout: Este layout podría precargar datos que son necesarios en todas las páginas de la consola (ej. estadísticas globales como número total de usuarios, sitios, campañas) y hacerlos disponibles a través de un Contexto de React. Esto evitaría que cada página anidada tenga que recargar estos datos.
 * 3. Notificaciones del Sistema: Integrar un pequeño sistema de notificaciones en la barra lateral o en un header para alertar a los desarrolladores sobre eventos críticos de la plataforma, como errores no controlados (vía Sentry) o picos de uso del servidor, proporcionando un monitoreo proactivo.
 */
/* MEJORAS PROPUESTAS (Consolidadas y Refinadas)
 * 1. **Componente de Perfil de Desarrollador:** Reemplazar el simple botón de "Cerrar Sesión" con un menú desplegable (`DropdownMenu`) que muestre el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 2. **Carga de Datos Globales del Layout:** Este layout podría precargar datos que serán necesarios en todas las páginas del `dev-console`, como estadísticas globales (número total de usuarios, sitios, etc.), y hacerlos disponibles a través de React Context para evitar la recarga en cada navegación de página.
 * 3. **Notificaciones del Sistema:** Integrar un pequeño sistema de notificaciones en la barra lateral o en un header para alertar a los desarrolladores sobre eventos críticos de la plataforma, como errores no controlados (vía Sentry) o picos de uso del servidor.
 * 1. **Resaltado de Ruta Activa:** Implementar un sub-componente `NavLink` que utilice el hook `usePathname` para determinar la ruta activa y aplicar estilos de resaltado (ej. fondo `bg-primary/10`, texto `text-primary`) al enlace correspondiente en la barra lateral.
 * 2. **Componente de Perfil de Desarrollador:** Reemplazar el simple botón de "Cerrar Sesión" con un menú desplegable (`DropdownMenu`) que muestre el nombre del desarrollador y su rol, similar al del dashboard de usuario, pero con un estilo más técnico.
 * 3. **Carga de Datos Globales del Layout:** Este layout podría precargar datos que serán necesarios en todas las páginas del `dev-console`, como estadísticas globales (número total de usuarios, sitios, etc.), y hacerlos disponibles a través de React Context para evitar la recarga en cada navegación de página.
 */

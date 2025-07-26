// app/[locale]/admin/page.tsx
/**
 * @file Página del Dashboard de Administración (Server Component)
 * @description Carga todos los sitios de la plataforma. La lógica de autorización
 * ahora se basa en el rol del usuario obtenido de la tabla `profiles` de Supabase.
 *
 * @author Metashark
 * @version 3.0.0 (Supabase Auth Integration)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllSites } from "@/lib/data/sites";
import { rootDomain } from "@/lib/utils";
import { AdminDashboard } from "./dashboard";
import { logger } from "@/lib/logging";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Gestionar todos los sitios en la plataforma ${rootDomain}.`,
};

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Verificación de rol a nivel de aplicación consultando la tabla de perfiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  if (profile?.app_role !== "developer") {
    logger.warn(
      `Acceso denegado a /admin para el usuario ${user.id} con rol '${profile?.app_role}'`
    );
    // Si un usuario normal intenta acceder, lo redirigimos a su propio dashboard.
    return redirect("/dashboard");
  }

  const rawSites = await getAllSites();

  // Transformar los datos para el componente cliente.
  const sites = rawSites.map((site) => ({
    subdomain: site.subdomain || "N/A",
    icon: site.icon || "❓",
    createdAt: new Date(site.created_at).getTime(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard sites={sites} user={user} />
    </div>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Streaming con Suspense:** Envolver `AdminDashboard` en un `<Suspense>` con un esqueleto de carga para mejorar la experiencia de usuario percibida.
 * 2. **Manejo de Errores de Carga:** Envolver `getAllSites` y la consulta de perfil en un `try/catch` para mostrar un mensaje de error amigable en la UI si la base de datos no está disponible.
 * 3. **RLS para Perfiles:** Asegurarse de que las Políticas de Seguridad a Nivel de Fila (RLS) en la tabla `profiles` permitan a los usuarios leer su propio perfil.
 */
/* MEJORAS PROPUESTAS
 * 1. **Paginación:** La carga de `getAllSites` debería implementarse con paginación para manejar un gran número de sitios sin degradar el rendimiento del dashboard de administración.
 * 2. **Streaming con Suspense:** Envolver `AdminDashboard` en un `<Suspense>` con un `fallback` de esqueleto de carga para mejorar la experiencia de usuario percibida durante la carga de datos.
 * 3. **Manejo de Errores de Carga:** Envolver `getAllSites` en un `try/catch` para manejar elegantemente los casos en que la base de datos no esté disponible, mostrando un mensaje de error amigable en la UI.
 * 1. **Streaming con Suspense:** Envolver `AdminDashboard` en `<Suspense>` con un esqueleto de carga para mejorar la experiencia de usuario mientras `getAllSubdomains` se resuelve.
 * 2. **Manejo de Errores de Carga de Datos:** Añadir un `try/catch` alrededor de `getAllSubdomains` y mostrar un mensaje de error amigable en la UI si la conexión a Redis falla.
 * 1. **Streaming con Suspense:** Envolver `AdminDashboard` en un `<Suspense>` con un `fallback` (ej. un esqueleto de carga) para mejorar la percepción de velocidad mientras se carga `getAllSubdomains`.
 * 2. **Paginación de Datos:** Si la cantidad de tenants crece mucho, implementar paginación en `getAllSubdomains` y pasar los parámetros de página desde esta página.
 * 3. **Server-Side-Props específicos de Rol:** Si se introducen roles, la data que se obtiene aquí (`getAllSubdomains`) podría variar según el rol del usuario en la sesión.
 */

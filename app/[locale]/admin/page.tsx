// app/[locale]/admin/page.tsx
/**
 * @file Admin Dashboard Page (Server Component)
 * @description Carga todos los tenants y transforma los datos para que coincidan
 * con las props esperadas por el componente cliente.
 *
 * @author Metashark
 * @version 2.1.0 (Data Transformation)
 */
import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllTenants } from "@/lib/platform/tenants";
import { rootDomain } from "@/lib/utils";
import { AdminDashboard } from "./dashboard";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Manage subdomains for ${rootDomain}`,
};

export default async function AdminPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "developer")
  ) {
    redirect("/login");
  }

  const rawTenants = await getAllTenants();

  // CORRECCIÓN: Transformar los datos aquí para que coincidan con las props del cliente
  const tenants = rawTenants.map((tenant) => ({
    ...tenant,
    createdAt: new Date(tenant.created_at).getTime(), // Convertimos a timestamp numérico
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard tenants={tenants} session={session} />
    </div>
  );
}
/* MEJORAS PROPUESTAS
 * 1. **Streaming con Suspense:** Envolver `AdminDashboard` en `<Suspense>` con un esqueleto de carga para mejorar la experiencia de usuario mientras `getAllSubdomains` se resuelve.
 * 2. **Manejo de Errores de Carga de Datos:** Añadir un `try/catch` alrededor de `getAllSubdomains` y mostrar un mensaje de error amigable en la UI si la conexión a Redis falla.
 * 1. **Streaming con Suspense:** Envolver `AdminDashboard` en un `<Suspense>` con un `fallback` (ej. un esqueleto de carga) para mejorar la percepción de velocidad mientras se carga `getAllSubdomains`.
 * 2. **Paginación de Datos:** Si la cantidad de tenants crece mucho, implementar paginación en `getAllSubdomains` y pasar los parámetros de página desde esta página.
 * 3. **Server-Side-Props específicos de Rol:** Si se introducen roles, la data que se obtiene aquí (`getAllSubdomains`) podría variar según el rol del usuario en la sesión.
 */

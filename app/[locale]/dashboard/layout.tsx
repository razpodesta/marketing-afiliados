// app/[locale]/dashboard/layout.tsx
/**
 * @file Dashboard Layout
 * @description Proporciona la estructura visual principal para todas las páginas dentro del
 * dashboard del suscriptor, incluyendo una barra lateral de navegación y un área de contenido principal.
 *
 * @author Metashark
 * @version 1.0.0
 */

import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // Doble protección, aunque el middleware ya se encarga de esto.
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Encabezado del Dashboard:** Añadir un componente `DashboardHeader` dentro de `<main>` que pueda mostrar el título de la página actual (usando `useSelectedLayoutSegment` en un componente cliente) y acciones rápidas.
 * 2. **Gestión de Estado Global:** Para funcionalidades más complejas (como notificaciones en tiempo real o el estado del plan del usuario), se podría integrar un gestor de estado como Zustand o Jotai, inicializándolo en este layout.
 */

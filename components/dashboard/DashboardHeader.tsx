/* Ruta: components/dashboard/DashboardHeader.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { DashboardSidebarContent } from "./DashboardSidebar";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

/**
 * @file DashboardHeader.tsx
 * @description Encabezado principal para el área de contenido del dashboard.
 * REFACTORIZACIÓN: Se ha eliminado el icono de chat con L.I.A. para simplificar
 * la interfaz y centrar la atención en las funcionalidades principales de gestión.
 *
 * @author Metashark
 * @version 2.1.0 (UI Simplification)
 */
type Workspace = { id: string; name: string };

type Props = {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
};

export function DashboardHeader({ user, workspaces, activeWorkspace }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      {/* Menú para dispositivos móviles */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-card p-0">
          <DashboardSidebarContent user={user} />
        </SheetContent>
      </Sheet>

      {/* Selector de Workspace */}
      <div className="w-full flex-1">
        <WorkspaceSwitcher
          user={user}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
        />
      </div>

      {/* Controles del lado derecho */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
/* Ruta: components/dashboard/DashboardHeader.tsx */


/* MEJORAS FUTURAS DETECTADAS
 * 1. Paleta de Comandos Global (`Ctrl+K`): Integrar un botón de búsqueda que abra una paleta de comandos (usando `cmdk`). Esto permitiría a los usuarios buscar sitios, navegar a páginas o ejecutar acciones rápidamente desde cualquier lugar del dashboard, una característica clave en las aplicaciones SaaS modernas para usuarios avanzados.
 * 2. Centro de Notificaciones: El espacio a la derecha es ideal para añadir un menú de notificaciones en tiempo real (usando un icono de campana y Supabase Realtime). Este mostraría un indicador cuando haya nuevas actualizaciones relevantes para el usuario (ej. "Tu campaña ha sido analizada por L.I.A.").
 * 3. Breadcrumbs Dinámicos: Debajo de este encabezado, se podría añadir un componente de "breadcrumbs" (migas de pan) que muestre la ruta de navegación actual del usuario (ej. `Dashboard > Mis Sitios > Campañas de MiSitio`). Esto mejora enormemente la orientación del usuario dentro de la aplicación a medida que la jerarquía de rutas se vuelve más profunda.
 */
/* MEJORAS PROPUESTAS
 * 1. **Paleta de Comandos Global (`Ctrl+K`):** Integrar un botón de búsqueda que abra una paleta de comandos (usando `cmdk`). Esto permitiría a los usuarios buscar sitios, navegar a páginas o ejecutar acciones rápidamente desde cualquier lugar del dashboard, una característica clave en las aplicaciones SaaS modernas.
 * 2. **Menú de Notificaciones:** Reemplazar el espacio vacío con un menú de notificaciones en tiempo real (usando Supabase Realtime) que muestre un indicador cuando haya nuevas actualizaciones relevantes para el usuario.
 * 3. **Breadcrumbs Dinámicos:** Debajo del header, añadir un componente de "breadcrumbs" (migas de pan) que muestre la ruta de navegación actual (ej. `Dashboard > Mis Sitios > Sitio A`), mejorando la orientación del usuario en la aplicación.
1.  **Título de Página Dinámico:** El header podría mostrar dinámicamente el título de la página
 *    actual (ej. "Mis Sitios", "Ajustes") utilizando los segmentos de la ruta (`useSelectedLayoutSegment`)
 *    para mejorar la contextualización del usuario.
2.  **Breadcrumbs:** Para una navegación más profunda, se podrían añadir "breadcrumbs" (migas de pan)
 *    debajo del header para mostrar al usuario su ubicación actual en la jerarquía del sitio
 *    (ej. Dashboard > Mis Sitios > Sitio A).
3.  **Barra de Búsqueda Global:** Integrar una barra de búsqueda o una paleta de comandos global
 *    (accesible con `Ctrl+K`) en el header para buscar rápidamente sitios, herramientas o acciones.
1.  **Título de Página Dinámico:** El header podría mostrar dinámicamente el título de la página
 *    actual (ej. "Mis Sitios", "Ajustes") utilizando los segmentos de la ruta (`useSelectedLayoutSegment`).
2.  **Breadcrumbs:** Para una navegación más profunda, se podrían añadir "breadcrumbs" (migas de pan)
 *    debajo del header para mostrar al usuario su ubicación actual en la jerarquía del sitio.
*/

// Ruta: components/layout/DashboardHeader.tsx (RECONECTADO Y COMPLETO)
"use client";

import { workspaces as workspaceActions } from "@/lib/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { useRealtimeInvitations } from "@/lib/hooks/use-realtime-invitations";
import { Bell, Check, LayoutGrid, Menu, Search } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { DashboardSidebarContent } from "./DashboardSidebar";

/**
 * @file DashboardHeader.tsx
 * @description Encabezado principal para el área de contenido del dashboard.
 * REFACTORIZACIÓN ARQUITECTÓNICA: Las importaciones han sido actualizadas
 * para reflejar la nueva estructura granular de componentes.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.1.0 (Architectural Alignment)
 */

const InvitationBell = () => {
  const { user, pendingInvitations } = useDashboard();
  const [isPending, startTransition] = React.useTransition();
  const invitations = useRealtimeInvitations(user, pendingInvitations);

  const handleAccept = (invitationId: string) => {
    startTransition(async () => {
      const result =
        await workspaceActions.acceptInvitationAction(invitationId);
      if (result.success) {
        toast.success(result.data?.message || "¡Te has unido al workspace!");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {invitations.length}
            </span>
          )}
          <span className="sr-only">Ver invitaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Invitaciones Pendientes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {invitations.length > 0 ? (
          invitations.map((inv) => (
            <DropdownMenuItem
              key={inv.id}
              className="flex items-center justify-between gap-2"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {inv.workspaces?.icon || <LayoutGrid className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">
                    Te invitaron a unirte a{" "}
                    <strong>{inv.workspaces?.name || "un workspace"}</strong>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept(inv.id)}
                disabled={isPending}
                className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
              >
                <Check className="h-4 w-4" />
              </Button>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No tienes invitaciones pendientes.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function DashboardHeader() {
  const { open } = useCommandPaletteStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-card p-0">
          <DashboardSidebarContent />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block">
        <WorkspaceSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        <Button
          variant="outline"
          className="gap-2 w-full max-w-[200px] justify-start text-muted-foreground hidden sm:inline-flex"
          onClick={open}
        >
          <Search className="h-4 w-4" />
          <span>Buscar...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <InvitationBell />
      </div>
    </header>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Notificaciones Genéricas: Expandir el sistema de la `InvitationBell` para que sea un centro de notificaciones genérico, capaz de mostrar no solo invitaciones, sino también otras alertas (ej. "Tu campaña ha sido publicada", "Error al conectar con una integración").
 * 2. Rechazar Invitaciones: Añadir un botón y una `Server Action` para que los usuarios puedan rechazar invitaciones, limpiando su lista de notificaciones.
 * 3. Búsqueda Integrada: En lugar de solo abrir la paleta, el botón de búsqueda podría evolucionar para convertirse en un input de búsqueda real que filtre contenido en la página actual o active la paleta con un término de búsqueda pre-rellenado.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Notificaciones en Tiempo Real: Usar Supabase Realtime para que la `InvitationBell` se actualice instantáneamente cuando llegue una nueva invitación, sin necesidad de recargar la página.
 * 2. Breadcrumbs Dinámicos: Debajo de este encabezado, añadir un componente de "breadcrumbs" (migas de pan) que muestre la ruta de navegación actual (ej. `Dashboard > Mis Sitios`), mejorando la orientación del usuario.
 * 3. Búsqueda Integrada: En lugar de solo abrir la paleta, el botón de búsqueda podría evolucionar para convertirse en un input de búsqueda real que filtre contenido en la página actual o active la paleta con un término de búsqueda pre-rellenado.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Paleta de Comandos Global (`Ctrl+K`): Integrar un botón de búsqueda que abra una paleta de comandos (`cmdk`) para buscar sitios, navegar o ejecutar acciones rápidamente.
 * 2. Notificaciones en Tiempo Real: Usar Supabase Realtime para que la `InvitationBell` se actualice instantáneamente cuando llegue una nueva invitación, sin necesidad de recargar la página.
 * 3. Breadcrumbs Dinámicos: Debajo de este encabezado, añadir un componente de "breadcrumbs" (migas de pan) que muestre la ruta de navegación actual (ej. `Dashboard > Mis Sitios`), mejorando la orientación del usuario.
 */
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

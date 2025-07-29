/**
 * @file components/feedback/CommandPalette.tsx
 * @description Componente de paleta de comandos global (accesible con Ctrl+K),
 *              que proporciona una interfaz de búsqueda rápida para navegar y
 *              ejecutar acciones en toda la aplicación.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.3.0 (Correct Type-Safe Navigation)
 */
"use client";

import { LayoutDashboard, LogOut, User } from "lucide-react";
import React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  session as sessionActions,
  workspaces as workspaceActions,
} from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { useRouter } from "@/navigation";

export function CommandPalette() {
  const { workspaces, activeWorkspace, modules } = useDashboard();
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [pages, setPages] = React.useState<"root" | "workspaces">("root");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPages("root");
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  React.useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const runCommand = React.useCallback(
    (action: () => void) => {
      close();
      action();
    },
    [close]
  );

  const mainNavLinks = modules.filter((module) => module.status === "active");

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput
        placeholder="Escribe un comando o busca..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        {pages === "root" && (
          <>
            <CommandGroup heading="Navegación">
              {mainNavLinks.map((link) => (
                <CommandItem
                  key={link.href}
                  onSelect={() =>
                    // El `useRouter` de next-intl es tipado y puede manejar
                    // directamente el tipo AppPathname de nuestro navigation.ts
                    runCommand(() => router.push(link.href as any))
                  }
                  value={`Ir a ${link.title}`}
                >
                  <DynamicIcon name={link.icon} className="mr-2 h-4 w-4" />
                  <span>{link.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Workspaces">
              <CommandItem onSelect={() => setPages("workspaces")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Buscar y cambiar de workspace...
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Cuenta">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/dashboard/settings"))
                }
                value="Ajustes de Cuenta"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => sessionActions.signOutAction())
                }
                value="Cerrar Sesión"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
        {pages === "workspaces" && (
          <CommandGroup heading="Workspaces">
            {workspaces
              .filter((workspace) =>
                workspace.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() =>
                    runCommand(() =>
                      workspaceActions.setActiveWorkspaceAction(workspace.id)
                    )
                  }
                  value={workspace.name}
                  disabled={workspace.id === activeWorkspace?.id}
                >
                  <span className="mr-2 text-lg">{workspace.icon || "🏢"}</span>
                  <span>{workspace.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la Paleta de Comandos.
 *
 * 1.  **Registro de Comandos Dinámico:** Implementar un sistema de registro donde diferentes partes de la aplicación puedan registrar sus propios comandos contextuales, en lugar de tener una lista estática.
 * 2.  **Búsqueda en Servidor para Entidades:** La búsqueda de workspaces debe invocar una Server Action para realizar la búsqueda en la base de datos y escalar a un gran número de entidades.
 * 3.  **Historial de Comandos Recientes:** Guardar los últimos comandos ejecutados en `localStorage` y mostrarlos en una sección "Recientemente Usados" para un acceso rápido.
 */
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la Paleta de Comandos.
 *
 * 1.  **Registro de Comandos Dinámico:** Implementar un sistema de registro donde diferentes partes de la aplicación puedan registrar sus propios comandos contextuales, en lugar de tener una lista estática.
 * 2.  **Búsqueda en Servidor para Entidades:** La búsqueda de workspaces debe invocar una Server Action para realizar la búsqueda en la base de datos y escalar a un gran número de entidades.
 * 3.  **Historial de Comandos Recientes:** Guardar los últimos comandos ejecutados en `localStorage` y mostrarlos en una sección "Recientemente Usados" para un acceso rápido.
 */

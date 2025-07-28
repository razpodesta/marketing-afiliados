// Ruta: components/dashboard/CommandPalette.tsx
/**
 * @file CommandPalette.tsx
 * @description Componente de paleta de comandos global (`Ctrl+K`).
 * REFACTORIZACIÓN ARQUITECTÓNICA:
 * 1. El componente ya no acepta props. Ahora consume todos los datos de sesión
 *    necesarios (`user`, `workspaces`, etc.) desde el `DashboardContext`.
 *
 * @author Metashark
 * @version 3.0.0 (Context-Driven Component)
 */
"use client";

import {
  session as sessionActions,
  workspaces as workspaceActions,
} from "@/app/actions";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { useRouter, type AppPathname } from "@/navigation";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import React from "react";

export function CommandPalette() {
  const { user, workspaces, activeWorkspace, modules } = useDashboard();
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [pages, setPages] = React.useState<"root" | "workspaces" | "modules">(
    "root"
  );

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

  const mainNavLinks = modules.filter((m) => m.status === "active");

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
                    runCommand(() => router.push(link.href as AppPathname))
                  }
                  value={`Ir a ${link.title}`}
                >
                  <link.icon className="mr-2 h-4 w-4" />
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
              .filter((ws) =>
                ws.name.toLowerCase().includes(search.toLowerCase())
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
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda de Contenido Dinámico Real: La búsqueda actual de workspaces es del lado del cliente. El siguiente paso es reemplazarla por una llamada a una Server Action que busque en la base de datos, ideal para usuarios con cientos de workspaces.
 * 2. Acciones Contextuales: Hacer que la lista de comandos disponibles cambie según la página en la que se encuentre el usuario. Por ejemplo, en la página de un sitio, podrían aparecer comandos como "Crear Nueva Campaña en este Sitio".
 * 3. Tematización y Personalización: Permitir a los usuarios personalizar los comandos que aparecen o su orden, guardando sus preferencias en la base de datos en el perfil de usuario.
 */

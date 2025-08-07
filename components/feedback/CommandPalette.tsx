// components/feedback/CommandPalette.tsx
/**
 * @file components/feedback/CommandPalette.tsx
 * @description Componente de paleta de comandos global. Ha sido refactorizado
 *              para importar sus Server Actions de forma atómica, respetando
 *              el límite Servidor-Cliente y resolviendo el error de compilación.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Atomic Server Action Imports)
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
import { signOutAction } from "@/lib/actions/session.actions";
import { setActiveWorkspaceAction } from "@/lib/actions/workspaces.actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { useRouter } from "@/lib/navigation";
import { logger } from "@/lib/logging";

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
    (action: () => void, commandName: string) => {
      logger.trace(`[CommandPalette] Executing command: ${commandName}`);
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
                    runCommand(() => router.push(link.href as any), link.title)
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
                  runCommand(
                    () => router.push("/dashboard/settings"),
                    "Go to Settings"
                  )
                }
                value="Ajustes de Cuenta"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(signOutAction, "Sign Out")}
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
                    runCommand(
                      () => setActiveWorkspaceAction(workspace.id),
                      `Switch to ${workspace.name}`
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
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Desacoplamiento de Importaciones Atómicas**: ((Implementada)) Se han refactorizado las importaciones de Server Actions para que apunten directamente a sus archivos de origen, resolviendo la violación del límite Servidor-Cliente y corrigiendo el error de compilación.
 * 2.  **Full Observabilidad**: ((Implementada)) Se ha añadido un log de `trace` en `runCommand` para registrar la ejecución de comandos, mejorando la visibilidad del comportamiento del usuario.
 *
 * @subsection Melhorias Futuras
 * 1.  **Registro de Comandos Dinámico**: ((Vigente)) Implementar un sistema de registro donde diferentes partes de la aplicación puedan registrar sus propios comandos contextuales.
 */
// components/feedback/CommandPalette.tsx

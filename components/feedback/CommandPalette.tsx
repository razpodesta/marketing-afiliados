// components/feedback/CommandPalette.tsx
/**
 * @file components/feedback/CommandPalette.tsx
 * @description Componente de paleta de comandos global. Ha sido refactorizado
 *              para consumir las Server Actions a través de sus namespaces atómicos,
 *              cumpliendo con el estándar de arquitectura del proyecto.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Atomic Namespace Alignment)
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
// --- INÍCIO DA REATORIZAÇÃO ARQUITETÓNICA ---
import {
  session as sessionActions,
  workspaces as workspaceActions,
} from "@/lib/actions";
// --- FIM DA REATORIZAÇÃO ARQUITETÓNICA ---
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { logger } from "@/lib/logging";
import { useRouter } from "@/lib/navigation";

export function CommandPalette() {
  const { user, workspaces, activeWorkspace, modules } = useDashboard();
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
      logger.trace("[CommandPalette] Executing command.", {
        userId: user.id,
        command: commandName,
      });
      close();
      action();
    },
    [close, user.id]
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
                onSelect={() =>
                  runCommand(sessionActions.signOutAction, "Sign Out")
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
                    runCommand(
                      () =>
                        workspaceActions.setActiveWorkspaceAction(workspace.id),
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
 * 1.  **Alinhamento Arquitetónico**: ((Implementada)) As importações de Server Actions agora utilizam namespaces (`sessionActions`, `workspaceActions`), melhorando a clareza e a manutenibilidade.
 * 2.  **Full Observability**: ((Implementada)) A função `runCommand` agora está instrumentada com logging contextual, fornecendo visibilidade sobre o uso da paleta de comandos.
 */
// components/feedback/CommandPalette.tsx

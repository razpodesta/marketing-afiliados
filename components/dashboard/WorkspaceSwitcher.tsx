// Ruta: components/dashboard/WorkspaceSwitcher.tsx

"use client";

import type { User } from "@supabase/supabase-js";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import * as React from "react";

import { setActiveWorkspaceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * @file WorkspaceSwitcher.tsx
 * @description Componente funcional para seleccionar y cambiar el workspace activo.
 * Ahora invoca una Server Action para persistir el cambio de contexto.
 *
 * @author Metashark
 * @version 1.1.0 (Action Integration)
 */

type Workspace = {
  id: string;
  name: string;
};

type Props = {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  className?: string;
};

export default function WorkspaceSwitcher({
  user,
  workspaces,
  activeWorkspace,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const onWorkspaceSelect = (workspace: Workspace) => {
    startTransition(() => {
      setActiveWorkspaceAction(workspace.id);
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar workspace"
          className={cn("w-[220px] justify-between", className)}
          disabled={isPending}
        >
          {activeWorkspace ? activeWorkspace.name : "Seleccionar workspace"}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar workspace..." />
            <CommandEmpty>No se encontró el workspace.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => onWorkspaceSelect(workspace)}
                  className="text-sm cursor-pointer"
                >
                  {workspace.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      activeWorkspace?.id === workspace.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  /* TODO */
                }}
                className="cursor-pointer"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Crear Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Implementar Server Action:** La funcionalidad `onWorkspaceSelect` debe llamar a una Server Action `setActiveWorkspaceAction(workspaceId)` que establezca la cookie de contexto y recargue la página.
2.  **Creación de Workspace:** El botón "Crear Workspace" debe redirigir a una nueva página (`/dashboard/workspaces/new`) con un formulario para crear una nueva organización.
3.  **Completar Componente `Command`:** Este componente depende del componente `Command` de `shadcn/ui`. Si no está instalado, se debe añadir (`pnpm dlx shadcn-ui@latest add command`).
*/

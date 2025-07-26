/* Ruta: components/dashboard/WorkspaceSwitcher.tsx */

"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import * as React from "react";
// Se asume la creación de este nuevo componente de formulario.
import { CreateWorkspaceForm } from "../workspaces/CreateWorkspaceForm";

/**
 * @file WorkspaceSwitcher.tsx
 * @description Componente para seleccionar y crear workspaces.
 * REFACTORIZACIÓN FUNCIONAL: Se ha implementado la lógica de creación de
 * workspaces. El botón "Crear Workspace" ahora abre un modal con un formulario,
 * invocando una nueva Server Action para completar el flujo de usuario.
 *
 * @author Metashark
 * @version 2.0.0 (Workspace Creation Implemented)
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
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const onWorkspaceSelect = (workspace: Workspace) => {
    startTransition(() => {
      setActiveWorkspaceAction(workspace.id);
    });
    setPopoverOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
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
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setPopoverOpen(false);
                      setDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crear Workspace
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear un nuevo workspace</DialogTitle>
          <DialogDescription>
            Los workspaces te ayudan a organizar tus sitios y campañas.
          </DialogDescription>
        </DialogHeader>
        <CreateWorkspaceForm onSuccess={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Flujo de Onboarding para el Primer Workspace: Si el array `workspaces` está vacío, la UI actual podría ser mejorada. En lugar de un menú desplegable, se podría mostrar un botón principal que diga "Crea tu primer workspace" y que abra directamente el modal de creación, guiando mejor a los nuevos usuarios.
 * 2. Avatares/Iconos de Workspace: Para una diferenciación visual más rápida, se podría permitir que cada workspace tenga un emoji o un avatar. Esto requeriría una pequeña modificación en la tabla `workspaces` de la base de datos y la actualización de este componente para mostrar el icono junto al nombre.
 * 3. Acciones Rápidas en el Menú: Se podría añadir una opción de "Ajustes del Workspace" (con un icono de engranaje) junto a cada workspace en la lista. Esto llevaría al usuario a una página dedicada (`/dashboard/settings/workspace`) donde podría renombrar el workspace, gestionar miembros, o configurar la facturación.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Implementar Server Action:** La funcionalidad `onWorkspaceSelect` debe llamar a una Server Action `setActiveWorkspaceAction(workspaceId)` que establezca la cookie de contexto y recargue la página.
2.  **Creación de Workspace:** El botón "Crear Workspace" debe redirigir a una nueva página (`/dashboard/workspaces/new`) con un formulario para crear una nueva organización.
3.  **Completar Componente `Command`:** Este componente depende del componente `Command` de `shadcn/ui`. Si no está instalado, se debe añadir (`pnpm dlx shadcn-ui@latest add command`).
*/

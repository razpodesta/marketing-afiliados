// Ruta: components/workspaces/WorkspaceSwitcher.tsx
/**
 * @file WorkspaceSwitcher.tsx
 * @description Componente de UI para seleccionar, crear y gestionar workspaces.
 *              Actúa como el selector de contexto principal para la navegación
 *              y la visualización de datos en toda la aplicación.
 * @author Metashark (Refactorizado por L.I.A Legacy & RaZ Podestá)
 * @version 6.0.0 (Type-Safe & Architecturally Aligned)
 */
"use client";

import {
  Check,
  ChevronsUpDown,
  LayoutGrid,
  PlusCircle,
  Settings,
  UserPlus,
} from "lucide-react";
import React from "react";

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
import { workspaces as workspaceActions } from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
// CORRECCIÓN: Con el `tsconfig.json` reparado, esta importación ahora se
// resuelve correctamente, eliminando el error `TS2307`.
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { CreateWorkspaceForm } from "../workspaces/CreateWorkspaceForm";
import { InviteMemberForm } from "../workspaces/InviteMemberForm";

type Workspace = { id: string; name: string; icon: string | null };

/**
 * @description Sub-componente para renderizar un ítem individual en la lista de workspaces.
 */
const WorkspaceItem = ({
  workspace,
  onSelect,
  isSelected,
}: {
  workspace: Workspace;
  onSelect: (workspace: Workspace) => void;
  isSelected: boolean;
}) => (
  <CommandItem
    key={workspace.id}
    onSelect={() => onSelect(workspace)}
    className="text-sm cursor-pointer"
    aria-label={workspace.name}
  >
    <span className="mr-2 text-lg">
      {workspace.icon || (
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
    <span className="truncate">{workspace.name}</span>
    <Check
      className={cn(
        "ml-auto h-4 w-4",
        isSelected ? "opacity-100" : "opacity-0"
      )}
    />
  </CommandItem>
);

export function WorkspaceSwitcher({ className }: { className?: string }) {
  const { workspaces, activeWorkspace } = useDashboard();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const onWorkspaceSelect = (workspace: Workspace) => {
    startTransition(() => {
      workspaceActions.setActiveWorkspaceAction(workspace.id);
    });
    setPopoverOpen(false);
  };

  const onGoToSettings = () => {
    router.push("/dashboard/settings");
    setPopoverOpen(false);
  };

  // --- Flujo de Onboarding ---
  if (workspaces.length === 0) {
    return (
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className={cn("w-full md:w-auto", className)}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Crea tu primer Workspace
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bienvenido a MetaShark</DialogTitle>
            <DialogDescription>
              Para empezar, crea un workspace para organizar tus sitios y
              campañas.
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccess={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  // --- Flujo Principal ---
  return (
    <div className="relative">
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear un nuevo workspace</DialogTitle>
            <DialogDescription>
              Los workspaces te ayudan a organizar tus sitios y campañas.
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccess={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar a un Miembro</DialogTitle>
            <DialogDescription>
              Invita a un nuevo miembro a tu workspace{" "}
              <strong>{activeWorkspace?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          {activeWorkspace && (
            <InviteMemberForm
              workspaceId={activeWorkspace.id}
              onSuccess={() => setInviteDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

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
            <div className="flex items-center gap-2 truncate">
              <span className="text-lg">
                {activeWorkspace?.icon || <LayoutGrid className="h-4 w-4" />}
              </span>
              <span className="truncate">
                {isPending
                  ? "Cambiando..."
                  : activeWorkspace
                    ? activeWorkspace.name
                    : "Seleccionar workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Buscar workspace..." />
              <CommandEmpty>No se encontró el workspace.</CommandEmpty>
              <CommandGroup>
                {workspaces.map((workspace) => (
                  <WorkspaceItem
                    key={workspace.id}
                    workspace={workspace}
                    onSelect={onWorkspaceSelect}
                    isSelected={activeWorkspace?.id === workspace.id}
                  />
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setPopoverOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Crear Workspace
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPopoverOpen(false);
                    setInviteDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Invitar Miembro
                </CommandItem>
                <CommandItem
                  onSelect={onGoToSettings}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Ajustes del Workspace
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `WorkspaceSwitcher` es el selector de contexto principal de la aplicación.
 *               Su correcta implementación es vital para la arquitectura multi-tenant.
 *
 * @functionality
 * - **Renderizado Condicional de Onboarding:** Su primera y más importante función es actuar como
 *   un "guardián de onboarding". Consume los datos del `DashboardContext` y, si el usuario no
 *   tiene workspaces, renderiza un estado de UI completamente diferente que lo guía a crear
 *   su primer workspace. Esto crea un flujo de usuario sin fricciones para las nuevas cuentas.
 * - **Selección de Contexto:** Cuando el usuario tiene workspaces, renderiza un `Popover` que
 *   contiene un componente de `Command` (un combobox con búsqueda). Esto permite al usuario
 *   buscar y seleccionar eficientemente el workspace en el que desea trabajar.
 * - **Orquestación de Acciones:**
 *   - Al seleccionar un nuevo workspace, invoca la Server Action `setActiveWorkspaceAction`
 *     envuelta en `useTransition`. Esta acción establece una cookie en el servidor y
 *     desencadena una recarga completa de los datos del layout, cambiando el contexto de
 *     toda la aplicación.
 *   - Proporciona accesos directos para abrir modales (`Dialogs`) que contienen los
 *     formularios para "Crear Workspace" e "Invitar Miembro", centralizando la gestión
 *     de workspaces en un único componente.
 *
 * @relationships
 * - Depende críticamente de `lib/context/DashboardContext.tsx` para obtener la lista de
 *   workspaces y el workspace activo.
 * - Utiliza `lib/navigation.ts` para la navegación segura a la página de ajustes.
 * - Invoca Server Actions de `lib/actions/workspaces.actions.ts`.
 * - Compone otros componentes complejos como `CreateWorkspaceForm` e `InviteMemberForm`.
 *
 * @expectations
 * - Se espera que este componente sea el punto central para que el usuario defina su contexto
 *   de trabajo. Su lógica debe ser robusta para manejar tanto el flujo de un nuevo usuario
 *   como el de un usuario existente con múltiples workspaces. La corrección de la ruta de
 *   importación asegura que pueda comunicarse con el sistema de enrutamiento tipado.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el selector de workspaces a un centro de control de nivel superior.
 *
 * 1.  **Búsqueda de Workspaces en Servidor:** Para usuarios que pertenecen a un gran número de workspaces (ej. agencias), la búsqueda en el cliente puede ser lenta. La funcionalidad debería evolucionar para que, al escribir en el `CommandInput`, se llame a una Server Action que realice la búsqueda en la base de datos y devuelva solo los resultados coincidentes.
 * 2.  **Carga Asíncrona "Bajo Demanda":** En lugar de cargar todos los workspaces en el `DashboardLayout`, el `WorkspaceSwitcher` podría cargar solo los primeros 10 y obtener más a medida que el usuario se desplaza por la lista (`infinite scroll`) o realiza una búsqueda, optimizando la carga inicial.
 * 3.  **Feedback Visual de Transición Mejorado:** Actualmente, el botón muestra "Cambiando...". Se podría mejorar el feedback mostrando un spinner (`<Loader2 />`) en el botón y manteniendo el nombre del workspace anterior visible pero atenuado hasta que la transición se complete, reduciendo la sensación de "salto" en la UI.
 */
// Ruta: components/workspaces/WorkspaceSwitcher.tsx
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Implementar Server Action:** La funcionalidad `onWorkspaceSelect` debe llamar a una Server Action `setActiveWorkspaceAction(workspaceId)` que establezca la cookie de contexto y recargue la página.
2.  **Creación de Workspace:** El botón "Crear Workspace" debe redirigir a una nueva página (`/dashboard/workspaces/new`) con un formulario para crear una nueva organización.
3.  **Completar Componente `Command`:** Este componente depende del componente `Command` de `shadcn/ui`. Si no está instalado, se debe añadir (`pnpm dlx shadcn-ui@latest add command`).
*/

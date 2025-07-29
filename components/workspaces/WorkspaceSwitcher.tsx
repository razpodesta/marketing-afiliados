// Ruta: components/dashboard/WorkspaceSwitcher.tsx
"use client";

import { workspaces as workspaceActions } from "@/app/actions";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/lib/context/DashboardContext";
import { cn } from "@/lib/utils";
import { useRouter } from "@/navigation";
import {
  Check,
  ChevronsUpDown,
  HelpCircle,
  LayoutGrid,
  PlusCircle,
  Settings,
  UserPlus,
} from "lucide-react";
import React from "react";
import { CreateWorkspaceForm } from "../workspaces/CreateWorkspaceForm";
import { InviteMemberForm } from "../workspaces/InviteMemberForm";

/**
 * @file WorkspaceSwitcher.tsx
 * @description Componente para seleccionar, crear y gestionar workspaces.
 * REFACTORIZACIÓN DE ESTABILIDAD:
 * 1. Corregido un error crítico de exportación. El componente ahora utiliza
 *    una exportación nombrada (`export function`) para ser correctamente
 *    importado por otros módulos.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.1.0 (Module Stability Patch)
 */

type Workspace = { id: string; name: string; icon: string | null };

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

// CORRECCIÓN: Se utiliza `export function` para una exportación nombrada.
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

  return (
    <div className="relative">
      {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
      <div
        data-lia-marker="true"
        className="absolute -top-1 left-0 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10"
      >
        WorkspaceSwitcher.tsx
      </div>

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

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es el selector de contexto principal de la aplicación.
 *  1.  **Consumo de Contexto:** Obtiene la lista completa de `workspaces` y el `activeWorkspace` del `useDashboard` hook.
 *  2.  **Renderizado Condicional:** Su primera lógica es verificar si el usuario tiene algún workspace. Si `workspaces.length === 0`, renderiza un botón para guiar al usuario a crear su primer workspace, implementando un flujo de onboarding crucial.
 *  3.  **Selector Principal:** Si hay workspaces, renderiza un `Popover` que contiene un `Command` (combobox). El botón `PopoverTrigger` muestra el workspace activo.
 *  4.  **Cambio de Contexto:** Al seleccionar un workspace diferente de la lista, invoca la Server Action `setActiveWorkspaceAction`. Esta acción establece una cookie en el servidor y recarga la página, haciendo que todo el dashboard se re-renderice con los datos del nuevo workspace activo.
 *  5.  **Acciones Secundarias:** El menú del `Command` también provee puntos de entrada para acciones relacionadas con la gestión de workspaces, como "Crear Workspace" e "Invitar Miembro", que abren sus respectivos `Dialogs`.
 *  Se espera que este componente sea el punto central para que el usuario defina su contexto de trabajo actual.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda de Workspaces en Servidor: Para usuarios que pertenecen a un gran número de workspaces (ej. agencias con cientos de clientes), la búsqueda en el cliente dentro del `CommandInput` puede ser lenta. La funcionalidad debería evolucionar para que, al escribir, se llame a una Server Action que realice la búsqueda en la base de datos y devuelva solo los resultados coincidentes.
 * 2. Carga Asíncrona de Workspaces "bajo demanda": Relacionado con lo anterior, en lugar de cargar todos los workspaces en el layout inicial, el `WorkspaceSwitcher` podría cargar solo los primeros 10 y obtener más a medida que el usuario se desplaza por la lista (`infinite scroll`) o realiza una búsqueda, optimizando drásticamente la carga inicial para usuarios con muchos workspaces.
 * 3. Feedback Visual de Transición Mejorado: Actualmente, el botón muestra "Cambiando..." durante la transición. Se podría mejorar el feedback visual mostrando un spinner (`<Loader2 />`) directamente en el botón y manteniendo el nombre del workspace anterior visible pero atenuado hasta que la transición se complete, reduciendo la sensación de "salto" en la UI.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato funciona como el sistema de navegación principal de la aplicación.
 *  Su lógica central es la presentación de una lista de enlaces de navegación
 *  basada en el estado del usuario y las reglas de la aplicación.
 *  1.  **Consumo de Contexto:** Obtiene los datos del usuario (`user`) desde el `DashboardContext`. Esto lo desacopla de la lógica de obtención de datos del servidor y le permite reaccionar a la información de la sesión.
 *  2.  **Construcción de Navegación:** Define un array estático, `mainNavLinks`, que representa la arquitectura de información de la aplicación. Este array es la única fuente de verdad para la navegación principal.
 *  3.  **Renderizado Condicional de Enlaces:** La lógica `if (userRole === 'developer')` añade dinámicamente el enlace a la "Dev Console" al array `mainNavLinks`, asegurando que solo los usuarios con el rol adecuado puedan ver esta opción.
 *  4.  **Estado Activo:** El sub-componente `NavLink` utiliza el hook `usePathname` de `next-intl` para determinar la ruta actual. Compara esta ruta con la `href` del enlace para aplicar un estilo "activo", proporcionando una clara indicación visual al usuario sobre su ubicación en la aplicación.
 *  5.  **Gestión de Funcionalidades Futuras:** El componente `NavLink` ahora interpreta una prop `status`. Si es "soon", renderiza un elemento deshabilitado con un tooltip, comunicando de forma elegante al usuario que esa funcionalidad está planificada pero aún no disponible.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Navegación Basada en Configuración: Para una máxima flexibilidad y para permitir que el equipo de producto gestione la navegación sin despliegues, la estructura `mainNavLinks` podría ser obtenida desde una tabla en Supabase o un archivo de configuración central. Esto permitiría controlar dinámicamente la visibilidad, el orden, los iconos y el estado ("soon", "beta") de cada enlace.
 * 2. Navegación Basada en Permisos de Plan: La lógica de renderizado condicional puede expandirse más allá del rol. Los enlaces podrían filtrarse basándose en el plan de suscripción del usuario (almacenado en `user.app_metadata.plan`). Esto permitiría mostrar u ocultar funcionalidades "premium" directamente desde la navegación principal.
 * 3. Sidebar Colapsable: Implementar un botón para colapsar la barra lateral, mostrando solo los iconos. El estado (colapsado/expandido) debería persistir en `localStorage` o en el perfil del usuario en la base de datos para que su preferencia se mantenga entre sesiones y dispositivos, mejorando la personalización de la interfaz.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Flujo de Aceptación de Invitación: El siguiente paso crítico es construir la UI y la lógica para que un usuario que recibe una invitación (por email, en un futuro) pueda aceptarla y unirse al workspace.
 * 2. Permisos Granulares para Invitación: La lógica actual permite invitar como "admin" o "member". Se podría añadir una comprobación en la Server Action para que solo los "owner" puedan invitar nuevos "admin", mientras que los "admin" solo puedan invitar "member".
 * 3. Búsqueda del Lado del Servidor: Si un usuario tiene cientos de workspaces, la búsqueda del lado del cliente puede volverse lenta. Refactorizar la búsqueda para que consulte al servidor y devuelva solo los resultados coincidentes.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Avatares Personalizados: Además de emojis, permitir la subida de una imagen personalizada como avatar del workspace, guardándola en Supabase Storage y actualizando el componente para mostrar `AvatarImage` en lugar de un `span`.
 * 2. Gestión de Miembros en el Menú: Añadir una acción rápida de "Invitar Miembro" en el menú, que abra directamente un modal para enviar invitaciones por correo, agilizando la colaboración.
 * 3. Búsqueda del Lado del Servidor: Si un usuario tiene cientos de workspaces, la búsqueda del lado del cliente puede volverse lenta. La funcionalidad de búsqueda podría ser refactorizada para pasar el término de búsqueda a una Server Action que devuelva solo los resultados coincidentes desde la base de datos.
 */
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

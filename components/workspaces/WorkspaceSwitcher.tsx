// components/workspaces/WorkspaceSwitcher.tsx
/**
 * @file WorkspaceSwitcher.tsx
 * @description Componente de UI para seleccionar, crear y gestionar workspaces.
 *              Ha sido refactorizado para una internacionalización y observabilidad
 *              completas en todos sus flujos de usuario.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.1.0 (Full I18n & Observability)
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
import { useTranslations } from "next-intl";
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
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { workspaces as workspaceActions } from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { logger } from "@/lib/logging";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { CreateWorkspaceForm } from "../workspaces/CreateWorkspaceForm";
import { InviteMemberForm } from "../workspaces/InviteMemberForm";

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

export function WorkspaceSwitcher({ className }: { className?: string }) {
  const t = useTranslations("WorkspaceSwitcher");
  const { user, workspaces, activeWorkspace } = useDashboard();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const onWorkspaceSelect = (workspace: Workspace) => {
    logger.trace("[WorkspaceSwitcher] User switching workspace context.", {
      userId: user.id,
      from: activeWorkspace?.id,
      to: workspace.id,
    });
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
      <Dialog open={!inviteDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("onboarding_welcome_title")}</DialogTitle>
            <DialogDescription>
              {t("onboarding_welcome_description")}
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccess={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="relative">
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createWorkspace_button")}</DialogTitle>
            <DialogDescription>
              {t("onboarding_welcome_description")}
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccess={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inviteMember_button")}</DialogTitle>
            <DialogDescription>
              {t.rich("inviteMember_description", {
                workspaceName: activeWorkspace?.name,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
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
            aria-label={t("selectWorkspace_label")}
            className={cn("w-[220px] justify-between", className)}
            disabled={isPending}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-lg">
                {activeWorkspace?.icon || <LayoutGrid className="h-4 w-4" />}
              </span>
              <span className="truncate">
                {isPending
                  ? t("changing_status")
                  : activeWorkspace
                    ? activeWorkspace.name
                    : t("selectWorkspace_label")}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder={t("search_placeholder")} />
              <CommandEmpty>{t("empty_results")}</CommandEmpty>
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
                  {t("createWorkspace_button")}
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPopoverOpen(false);
                    setInviteDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t("inviteMember_button")}
                </CommandItem>
                <CommandItem
                  onSelect={onGoToSettings}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  {t("workspaceSettings_button")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Full Observability**: ((Implementada)) A ação `onWorkspaceSelect` agora está instrumentada com logging contextual, fornecendo visibilidade sobre as mudanças de contexto do utilizador.
 * 2. **Internacionalização Completa**: ((Implementada)) Todos os textos visíveis por o utilizador foram abstraídos para chaves de tradução.
 */
// components/workspaces/WorkspaceSwitcher.tsx

// components/layout/DashboardHeader.tsx
/**
 * @file DashboardHeader.tsx
 * @description Encabezado del dashboard, ahora completamente internacionalizado
 *              y refactorizado para utilizar el namespace de acciones atómico correcto.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.1.0 (Atomic Action & I18n Refactor)
 */
"use client";

import { Bell, Check, LayoutGrid, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import toast from "react-hot-toast";

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
import { invitations as invitationActions } from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useCommandPaletteStore } from "@/lib/hooks/use-command-palette";
import { useRealtimeInvitations } from "@/lib/hooks/use-realtime-invitations";
import { logger } from "@/lib/logging";

import { DashboardSidebarContent } from "./DashboardSidebar";

const InvitationBell = () => {
  const t = useTranslations("InvitationBell");
  const { user, pendingInvitations } = useDashboard();
  const [isPending, startTransition] = React.useTransition();
  const invitations = useRealtimeInvitations(user, pendingInvitations);

  const handleAccept = (invitationId: string) => {
    logger.trace("[InvitationBell] User accepting invitation.", {
      userId: user.id,
      invitationId,
    });
    startTransition(async () => {
      const result =
        await invitationActions.acceptInvitationAction(invitationId);
      if (result.success) {
        toast.success(result.data.message || t("accept_invitation_success"));
        logger.info("[InvitationBell] Invitation accepted successfully.", {
          userId: user.id,
          invitationId,
        });
      } else {
        toast.error(result.error || t("accept_invitation_error"));
        logger.error("[InvitationBell] Failed to accept invitation.", {
          userId: user.id,
          invitationId,
          error: result.error,
        });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={t("view_invitations_sr")}
        >
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {invitations.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("pending_invitations_label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
            <DropdownMenuItem
              key={invitation.id}
              className="flex items-center justify-between gap-2"
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {invitation.workspaces?.icon || (
                      <LayoutGrid className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">
                    {t.rich("invitation_text", {
                      workspaceName: invitation.workspaces?.name || "...",
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept(invitation.id)}
                disabled={isPending}
                className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
              >
                <Check className="h-4 w-4" />
              </Button>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {t("no_pending_invitations")}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function DashboardHeader() {
  const { open } = useCommandPaletteStore();
  const t = useTranslations("DashboardHeader");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("mobile_openMenu_sr")}</span>
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
          <span>{t("search_placeholder")}</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">{t("search_command")}</span>
          </kbd>
        </Button>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <InvitationBell />
      </div>
    </header>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Alinhamento Arquitetónico**: ((Implementada)) A importação da Server Action foi corrigida para `import { invitations as invitationActions } from "@/lib/actions"`, e a chamada foi atualizada para `invitationActions.acceptInvitationAction`, resolvendo o `Attempted import error`.
 * 2. **Full Observability**: ((Implementada)) O handler `handleAccept` agora está instrumentado com logging contextual (`trace`, `info`, `error`), fornecendo uma visibilidade completa do fluxo de aceitação de convites.
 */
// components/layout/DashboardHeader.tsx

// components/workspaces/InviteMemberForm.tsx
/**
 * @file InviteMemberForm.tsx
 * @description Formulario para invitar a un nuevo miembro a un workspace. Ha sido
 *              refactorizado para alinearse con la arquitectura atómica de acciones,
 *              garantizar una renderización de errores segura y ser completamente
 *              internacionalizado y observable.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Atomic, I18n & Type-Safe)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// --- INÍCIO DA REATORIZAÇÃO ARQUITETÓNICA ---
import { invitations as invitationActions } from "@/lib/actions";
// --- FIM DA REATORIZAÇÃO ARQUITETÓNICA ---
import { logger } from "@/lib/logging";
import { InvitationSchema } from "@/lib/validators";

type FormData = z.infer<typeof InvitationSchema>;

export function InviteMemberForm({
  workspaceId,
  onSuccess,
}: {
  workspaceId: string;
  onSuccess: () => void;
}) {
  const t = useTranslations("WorkspaceSwitcher");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      workspaceId,
      role: "member",
      email: "",
    },
  });

  const processSubmit = (data: FormData) => {
    logger.trace("[InviteMemberForm] Submitting invitation.", {
      workspaceId,
      email: data.email,
      role: data.role,
    });
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("role", data.role);
      formData.append("workspaceId", data.workspaceId);

      // --- INÍCIO DA REATORIZAÇÃO ARQUITETÓNICA ---
      const result =
        await invitationActions.sendWorkspaceInvitationAction(formData);
      // --- FIM DA REATORIZAÇÃO ARQUITETÓNICA ---

      if (result.success) {
        toast.success(result.data.message);
        logger.info("[InviteMemberForm] Invitation sent successfully.", {
          workspaceId,
          email: data.email,
        });
        reset();
        onSuccess();
      } else {
        toast.error(result.error);
        logger.error("[InviteMemberForm] Failed to send invitation.", {
          workspaceId,
          email: data.email,
          error: result.error,
        });
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="email">{t("invite_form.email_label")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("invite_form.email_placeholder")}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {/* --- INÍCIO DA CORREÇÃO DE TIPO (TS2322) --- */}
        {errors.email?.message && (
          <p className="text-sm text-destructive" role="alert">
            {String(errors.email.message)}
          </p>
        )}
        {/* --- FIM DA CORREÇÃO DE TIPO --- */}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">{t("invite_form.role_label")}</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="role" aria-invalid={!!errors.role}>
                <SelectValue placeholder={t("invite_form.role_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  {t("invite_form.role_member")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("invite_form.role_admin")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {/* --- INÍCIO DA CORREÇÃO DE TIPO (TS2322) --- */}
        {errors.role?.message && (
          <p className="text-sm text-destructive" role="alert">
            {String(errors.role.message)}
          </p>
        )}
        {/* --- FIM DA CORREÇÃO DE TIPO --- */}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? t("invite_form.sending_button")
          : t("invite_form.send_button")}
      </Button>
    </form>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Alinhamento Arquitetónico**: ((Implementada)) A chamada à Server Action agora aponta para `invitationActions.sendWorkspaceInvitationAction`, resolvendo o erro `TS2339`.
 * 2.  **Renderização Segura de Erros**: ((Implementada)) As mensagens de erro agora são convertidas para string (`String(...)`) antes de serem renderizadas, resolvendo o erro de tipo `TS2322`.
 * 3.  **Full Internacionalização**: ((Implementada)) Todos os textos visíveis (labels, placeholders, botões) foram abstraídos para chaves de tradução.
 * 4.  **Full Observability**: ((Implementada)) O handler `processSubmit` agora está instrumentado com logging contextual.
 */
// components/workspaces/InviteMemberForm.tsx

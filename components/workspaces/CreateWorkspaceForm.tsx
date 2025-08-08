// components/workspaces/CreateWorkspaceForm.tsx
/**
 * @file CreateWorkspaceForm.tsx
 * @description Formulario de cliente para la creación de nuevos workspaces.
 *              Ha sido refactorizado para ser completamente internacionalizado
 *              y observable, cumpliendo con todos los mandatos de ingeniería.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Full I18n & Observability)
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
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { workspaces as workspaceActions } from "@/lib/actions";
import { logger } from "@/lib/logging";
import { CreateWorkspaceSchema } from "@/lib/validators";

type FormData = z.infer<typeof CreateWorkspaceSchema>;

export function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("WorkspaceSwitcher");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: {
      workspaceName: "",
      icon: "🚀",
    },
  });

  const processSubmit = (data: FormData) => {
    logger.trace("[CreateWorkspaceForm] Submitting new workspace.", {
      workspaceName: data.workspaceName,
    });
    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceName", data.workspaceName);
      formData.append("icon", data.icon);

      const result = await workspaceActions.createWorkspaceAction(formData);

      if (result.success) {
        toast.success(t("create_form.success_toast"));
        logger.info("[CreateWorkspaceForm] Workspace created successfully.", {
          workspaceId: result.data.id,
        });
        onSuccess();
      } else {
        toast.error(result.error);
        logger.error("[CreateWorkspaceForm] Failed to create workspace.", {
          error: result.error,
        });
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">{t("create_form.name_label")}</Label>
        <Input
          id="workspaceName"
          placeholder={t("create_form.name_placeholder")}
          aria-invalid={!!errors.workspaceName}
          {...register("workspaceName")}
        />
        {errors.workspaceName?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.workspaceName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("create_form.icon_label")}</Label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal bg-input"
                  type="button"
                >
                  <span className="mr-4 text-2xl">{field.value}</span>
                  <span>{t("create_form.icon_placeholder")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0">
                <EmojiPicker
                  onEmojiSelect={({ emoji }) => field.onChange(emoji)}
                >
                  <EmojiPickerSearch />
                  <EmojiPickerContent />
                  <EmojiPickerFooter />
                </EmojiPicker>
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.icon?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.icon.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? t("create_form.creating_button")
          : t("create_form.create_button")}
      </Button>
    </form>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Full Internacionalização**: ((Implementada)) Todos os textos visíveis foram abstraídos para chaves de tradução, eliminando a dívida de i18n.
 * 2. **Full Observability**: ((Implementada)) O handler de submissão agora está instrumentado com logging contextual.
 */
// components/workspaces/CreateWorkspaceForm.tsx

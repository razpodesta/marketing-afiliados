// components/sites/DeleteSiteDialog.tsx
/**
 * @file DeleteSiteDialog.tsx
 * @description Modal de confirmación para la eliminación irreversible de un sitio.
 *              Refatorado para ser um componente de apresentação 100% puro
 *              e agnóstico ao conteúdo, recebendo todos os textos via props.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 3.0.0 (Pure I18n Component)
 */
"use client";

import { Loader2, ShieldAlert, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
export interface DeleteSiteDialogTexts {
  title: string;
  description: (subdomain: string) => React.ReactNode;
  cancelButton: string;
  confirmButton: string;
}

interface SimpleSite {
  id: string;
  subdomain: string | null;
}

interface DeleteSiteDialogProps {
  site: SimpleSite;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  texts: DeleteSiteDialogTexts;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

export function DeleteSiteDialog({
  site,
  onDelete,
  isPending,
  texts,
  onClick,
}: DeleteSiteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onClick}
          aria-label={`Eliminar el sitio ${site.subdomain}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={onDelete}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              {texts.title}
            </DialogTitle>
            <DialogDescription>
              {texts.description(site.subdomain || "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {texts.cancelButton}
              </Button>
            </DialogClose>
            <input type="hidden" name="siteId" value={site.id} />
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {texts.confirmButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) O componente agora é 100% agnóstico ao conteúdo.
 * 2. **Suporte a Rich Text**: ((Implementada)) A prop `description` agora aceita `React.ReactNode`, permitindo que o componente pai passe texto formatado (e.g., com `<strong>`).
 */
// components/sites/DeleteSiteDialog.tsx

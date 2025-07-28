/**
 * @file DeleteSiteDialog.tsx
 * @description Modal de confirmación para la eliminación irreversible de un sitio.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 1.2.0 (Type Stability Patch)
 */
"use client";

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
import { Loader2, ShieldAlert, Trash2 } from "lucide-react";

// CORRECCIÓN: Se define una interfaz local y simple para eliminar la ambigüedad.
// Esto asegura que el componente solo dependa de los datos que realmente necesita.
interface SimpleSite {
  id: string;
  subdomain: string | null;
}

interface DeleteSiteDialogProps {
  site: SimpleSite; // Se utiliza la interfaz simple y explícita.
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}

export function DeleteSiteDialog({
  site,
  onDelete,
  isPending,
}: DeleteSiteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={onDelete}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              ¿Estás seguro?
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. El sitio{" "}
              <strong className="font-medium text-foreground">
                {site.subdomain}
              </strong>
              , junto con todas sus campañas y datos, será eliminado
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <input type="hidden" name="siteId" value={site.id} />
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar sitio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// components/sites/DeleteSiteDialog.tsx
/**
 * @file DeleteSiteDialog.tsx
 * @description Modal de confirmación para la eliminación irreversible de un sitio.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Decoupled & Robust)
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

/**
 * @interface SimpleSite
 * @description Define una interfaz local y simple para las props del componente.
 *              Esto desacopla el componente de la forma de datos completa `SiteWithCampaignsCount`,
 *              haciéndolo más reutilizable y robusto, ya que solo depende de los datos que
 *              realmente necesita para su operación.
 */
interface SimpleSite {
  id: string;
  subdomain: string | null;
}

interface DeleteSiteDialogProps {
  site: SimpleSite;
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Input de Confirmación: Para acciones destructivas de alto riesgo, se podría añadir un campo de texto donde el usuario deba escribir el nombre del subdominio para habilitar el botón de eliminar. Esto previene eliminaciones accidentales.
 * 2. Feedback de Carga Específico: El estado `isPending` podría ser más granular, indicando no solo la carga, sino también los estados "success" y "error" para mostrar un feedback visual dentro del modal antes de que se cierre.
 * 3. Reutilización del Componente: Este patrón de diálogo de confirmación es altamente reutilizable. Podría ser abstraído a un componente genérico `<ConfirmationDialog>` que acepte título, descripción y la acción a ejecutar.
 */

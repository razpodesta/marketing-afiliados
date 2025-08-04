// components/campaigns/CampaignsHeader.tsx
/**
 * @file CampaignsHeader.tsx
 * @description Componente de presentación puro para el encabezado de la página de
 *              gestión de campañas. Encapsula la navegación, el título contextual
 *              y el diálogo de creación.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
"use client";

import { ArrowLeft, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "@/lib/navigation";
import { CreateCampaignForm } from "./CreateCampaignForm";

interface CampaignsHeaderProps {
  siteId: string;
  siteSubdomain: string | null;
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  isCreating: boolean;
  onCreate: (formData: FormData) => void;
}

export function CampaignsHeader({
  siteId,
  siteSubdomain,
  isCreateDialogOpen,
  setCreateDialogOpen,
  isCreating,
  onCreate,
}: CampaignsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/sites">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Sitios
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Campañas para: <span className="text-primary">{siteSubdomain}</span>
        </h1>
        <p className="text-muted-foreground">
          Crea y edita las páginas para este sitio.
        </p>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Campaña</DialogTitle>
          </DialogHeader>
          <CreateCampaignForm
            siteId={siteId}
            onSubmit={onCreate}
            isPending={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

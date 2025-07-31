// Ruta: components/sites/SitesHeader.tsx
/**
 * @file SitesHeader.tsx
 * @description Encabezado para la página "Mis Sitios", que contiene el título, la
 *              barra de búsqueda y el disparador del modal de creación. Ha sido
 *              refactorizado para adherirse a un contrato de tipos estricto y cohesivo.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Simplified Cohesive Design)
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import { useRouter } from "@/lib/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { CreateSiteForm } from "./CreateSiteForm";

// CORRECCIÓN: La interfaz de props se simplifica enormemente.
interface SitesHeaderProps {
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  workspaceId: string;
}

export function SitesHeader({
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  setSearchQuery,
  workspaceId,
}: SitesHeaderProps) {
  const router = useRouter();

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh(); // Notifica al router que revalide los datos de la página.
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
      <div>
        <h1 className="text-2xl font-bold">Mis Sitios</h1>
        <p className="text-muted-foreground">
          Gestiona y busca en tus sitios. Cada sitio puede tener múltiples
          campañas.
        </p>
      </div>

      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por subdominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Sitio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear un nuevo sitio</DialogTitle>
            </DialogHeader>
            <CreateSiteForm
              workspaceId={workspaceId}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `SitesHeader.tsx` es un componente de UI "controlado" y de presentación.
 *
 * @functionality
 * - **Presentación Pura:** Su única responsabilidad es renderizar la UI del encabezado. No
 *   gestiona su propio estado de envío, sino que lo delega a sus hijos.
 * - **Orquestación de Diálogo:** Controla el estado de apertura y cierre del `Dialog` que
 *   contiene el `CreateSiteForm`.
 * - **Corrección de Contrato:** La interfaz `SitesHeaderProps` ha sido actualizada para
 *   eliminar las props `onSubmitCreate` y `isCreating`, que ya no son necesarias. Ahora
 *   define una función `handleCreateSuccess` que pasa como callback `onSuccess` al formulario,
 *   desacoplando completamente al header de la lógica de envío del formulario.
 *
 * @relationships
 * - Es un componente hijo de `SitesClient.tsx`.
 * - Es el padre de `CreateSiteForm.tsx`, al cual le pasa la callback `onSuccess`.
 *
 * @expectations
 * - Se espera que este componente actúe como una capa de presentación pura. Su contrato de
 *   props ahora es robusto, seguro en tipos y alineado con la arquitectura cohesiva.
 * =================================================================================================
 */

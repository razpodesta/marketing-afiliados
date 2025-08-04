// components/sites/SitesHeader.tsx
/**
 * @file SitesHeader.tsx
 * @description Encabezado para la página "Mis Sitios". Compone la UI para
 *              el título, la búsqueda con debounce y el diálogo de creación.
 *              Su contrato de props ha sido alineado para recibir el estado
 *              de carga desde el orquestador padre.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.0.0
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import React from "react";

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

interface SitesHeaderProps {
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  workspaceId: string;
  onCreate: (formData: FormData) => void;
  isPending: boolean;
}

export function SitesHeader({
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  onSearchChange,
  workspaceId,
  onCreate,
  isPending,
}: SitesHeaderProps) {
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
            onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={() => onSearchChange("")}
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
              onSuccess={onCreate}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

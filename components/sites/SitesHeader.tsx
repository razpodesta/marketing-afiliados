// components/sites/SitesHeader.tsx
/**
 * @file SitesHeader.tsx
 * @description Encabezado para la página "Mis Sitios". Este aparato ha sido refactorizado a un
 *              componente controlado, recibiendo el estado de la búsqueda y los manejadores de
 *              eventos como props. Encapsula la UI para el título, la barra de búsqueda y el
 *              disparador del modal de creación, alineándose con la arquitectura de búsqueda en servidor.
 * @author Metashark (Refactorizado por L.I.A Legacy & RaZ Podestá)
 * @version 5.0.0 (Server-Side Search & Controlled Component Pattern)
 *
 * @see {@link file://./SitesHeader.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para el encabezado de la página de sitios.
 *
 * 1.  **Dropdown de Ordenamiento**: (Vigente) Añadir un componente `<Select>` junto a la barra de búsqueda para permitir al usuario ordenar los sitios por "Fecha de Creación" o "Nombre", pasando el valor seleccionado a un nuevo manejador de eventos `onSortChange`.
 * 2.  **Selector de Vista (Cuadrícula/Lista)**: (Vigente) Incorporar un interruptor o grupo de botones para que el usuario pueda alternar entre una vista de cuadrícula (`<SitesGrid>`) y una vista de tabla (`<SitesTable>`), mejorando la accesibilidad y la densidad de información para usuarios avanzados.
 * 3.  **Animaciones de Layout con Framer Motion**: (Vigente) Envolver los elementos del encabezado en `motion.div` para añadir animaciones de entrada sutiles, mejorando la estética y la percepción de fluidez al cargar la página.
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
}

export function SitesHeader({
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  onSearchChange,
  workspaceId,
}: SitesHeaderProps) {
  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
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
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
// components/sites/SitesHeader.tsx
